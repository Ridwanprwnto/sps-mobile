// src/screens/main/sortingpool/SortingPoolScreen.js
import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Animated, RefreshControl, TextInput, Keyboard, ScrollView } from "react-native";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useAuthStore, useSortingStore } from "../../../store";
import { Button, ConfirmDialog, Snackbar, EmptyState, LoadingView } from "../../../components";
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from "../../../constants";
import { calcProgress, getScanStatusConfig, formatDate } from "../../../utils";

// ─── HELPER: Ekstraksi Nomor Pick dari Barcode Container ──────────────────────
/**
 * Barcode container memiliki format 13 digit angka:
 *
 *   [ PREFIX ][ NOPICK (running number) ][ SUFFIX ]
 *
 * @param {string} raw - input mentah dari user/scanner
 * @returns {{ nopick: string, isFromBarcode: boolean, originalBarcode: string|null }}
 */
const extractNopickFromInput = (raw) => {
    const trimmed = raw.trim();

    // Cek apakah input adalah barcode container: tepat 13 digit angka
    if (/^\d{13}$/.test(trimmed)) {
        // ─── Konstanta format barcode ───────────────────────────────────────────
        // PREFIX_LENGTH: jumlah digit prefix di depan (saat ini 2, update ke 1 saat nopick 8 digit)
        // SUFFIX_LENGTH: jumlah digit suffix di belakang (selalu 4, nomor urut container)
        const PREFIX_LENGTH = 2;
        const SUFFIX_LENGTH = 4;

        // Ekstrak nomor pick berdasarkan posisi: buang prefix awal & suffix akhir
        const nopick = trimmed.slice(PREFIX_LENGTH, trimmed.length - SUFFIX_LENGTH);

        return { nopick, isFromBarcode: true, originalBarcode: trimmed };
    }

    // Bukan barcode 13 digit → anggap langsung sebagai nomor pick
    return { nopick: trimmed, isFromBarcode: false, originalBarcode: null };
};

// ─── PHASE: Input Nopick ──────────────────────────────────────────────────────
const PhaseInput = ({ onSubmit, isLoading, error, onReset, previewData, onStartSorting, onCancelPreview, scannedBarcode }) => {
    const [nopick, setNopick] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 300);
    }, []);

    const handleSubmit = () => {
        if (nopick.trim()) onSubmit(nopick.trim());
    };

    // Deteksi real-time: apakah input saat ini adalah barcode container 13 digit
    const { isFromBarcode: isBarcodeDetected, nopick: detectedNopick } = extractNopickFromInput(nopick);

    // Warna dinamis input: hijau jika barcode terdeteksi, merah jika error, default jika biasa
    const inputBorderColor = error ? Colors.error : isBarcodeDetected ? Colors.success : Colors.border;
    const inputIconColor   = error ? Colors.error : isBarcodeDetected ? Colors.success : Colors.gray400;

    return (
        <ScrollView contentContainerStyle={styles.phaseInputWrap} keyboardShouldPersistTaps="handled">
            <View style={styles.phaseInputCard}>
                {/* Icon */}
                <View style={styles.phaseInputIcon}>
                    <Icon name="barcode-scan" size={44} color={Colors.primary} />
                </View>
                <Text style={styles.phaseInputTitle}>Cek Nomor Pick</Text>
                <Text style={styles.phaseInputSubtitle}>
                    Scan barcode container atau ketik nomor pick untuk memeriksa status proses penyortiran barang
                </Text>

                {/* Input Field */}
                <View style={[styles.nopickInputWrap, { borderColor: inputBorderColor }, isBarcodeDetected && styles.nopickInputWrapBarcode]}>
                    <Icon name="barcode" size={22} color={inputIconColor} style={styles.nopickInputIcon} />
                    <TextInput
                        ref={inputRef}
                        style={styles.nopickInput}
                        placeholder="No Pick / Barcode Container"
                        placeholderTextColor={Colors.gray300}
                        value={nopick}
                        onChangeText={(text) => {
                            setNopick(text);
                            if (previewData) onCancelPreview();
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        editable={!isLoading}
                    />
                    {nopick.length > 0 && (
                        <TouchableOpacity onPress={() => setNopick("")} style={styles.clearBtn}>
                            <Icon name="close-circle" size={18} color={Colors.gray300} />
                        </TouchableOpacity>
                    )}
                </View>

                {error && (
                    <View style={styles.phaseInputError}>
                        <Icon name="alert-circle" size={14} color={Colors.error} />
                        <Text style={styles.phaseInputErrorText}>{error}</Text>
                    </View>
                )}

                <Button
                    title={isLoading ? "Memuat..." : "Cari"}
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={!nopick.trim() || isLoading || !!previewData}
                    fullWidth
                    size="lg"
                    iconRight={isLoading ? undefined : "arrow-right"}
                    style={styles.phaseInputBtn}
                />

                {previewData && previewData.data && previewData.data.header && (
                    <View style={{ width: "100%", marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm }}>
                        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs }}>Data Ditemukan</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: Colors.textSecondary }}>Kode Toko</Text>
                            <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.semiBold }}>{previewData.data.header.Toko || "-"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: Colors.textSecondary }}>Nama Toko</Text>
                            <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.semiBold, textAlign: "right", flex: 1, marginLeft: 10 }}>{previewData.data.header.TOK_NAME || "-"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: Colors.textSecondary }}>Tanggal Pick</Text>
                            <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.semiBold }}>{formatDate(previewData.data.header.TglPic)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: Colors.textSecondary }}>Gate</Text>
                            <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.semiBold }}>{previewData.data.header.Gate || "-"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: Colors.textSecondary }}>Nomor SP</Text>
                            <Text style={{ color: Colors.textPrimary, fontWeight: FontWeight.semiBold }}>{previewData.data.header.NO_URUTSP || "-"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.xs, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border }}>
                            <Text style={{ color: Colors.textSecondary }}>Total Container</Text>
                            <Text style={{ color: Colors.primary, fontWeight: FontWeight.bold }}>{previewData.data.details ? previewData.data.details.length : 0}</Text>
                        </View>

                        <View style={{ flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md }}>
                            <Button title="Batal" variant="outline" onPress={onCancelPreview} style={{ flex: 1 }} disabled={isLoading} />
                            <Button title="Mulai Proses" variant="primary" onPress={onStartSorting} style={{ flex: 1 }} loading={isLoading} disabled={isLoading} />
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

// ─── Container Item Row ───────────────────────────────────────────────────────
const ContainerItem = ({ item, index }) => {
    const isScanned = item.is_scanned === true;
    const cfg = getScanStatusConfig(isScanned ? "Y" : "N");
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isScanned) {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [isScanned]);

    return (
        <Animated.View style={[styles.containerItem, isScanned && styles.containerItemScanned, { transform: [{ scale: scaleAnim }] }]}>
            {/* Nomor urut */}
            <View style={[styles.containerSeq, { backgroundColor: isScanned ? Colors.successBg : Colors.gray100 }]}>
                <Text style={[styles.containerSeqText, { color: isScanned ? Colors.success : Colors.gray400 }]}>{String(index + 1).padStart(2, "0")}</Text>
            </View>

            {/* Info container */}
            <View style={styles.containerInfo}>
                <Text style={styles.containerDusno}>{item.dusno || item.DusNo || "-"}</Text>
                <Text style={styles.containerMeta} numberOfLines={1}>
                    Zona: {item.zona || item.Zona || "-"}
                </Text>
                {item.scan_time && (
                    <Text style={styles.containerTime}>
                        <Icon name="clock-outline" size={10} color={Colors.gray400} /> {formatDate(item.scan_time, "datetime")}
                    </Text>
                )}
            </View>

            {/* Status badge */}
            <View style={[styles.containerStatus, { backgroundColor: cfg.bg }]}>
                <Icon name={cfg.icon} size={20} color={cfg.color} />
                <Text style={[styles.containerStatusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
        </Animated.View>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const SortingPoolScreen = ({ navigation }) => {
    const { user } = useAuthStore();
    const { nopick, sortingData, isLoadingInit, isLoadingScan, isCompleting, error, initSorting, checkPreviewNopick, scanContainer, completeProcess, resetSorting, resetError } = useSortingStore();

    const [forceScanning, setForceScanning] = useState(false);
    const [filterTab, setFilterTab] = useState("all");
    const [scanInput, setScanInput] = useState("");
    const [showComplete, setShowComplete] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: "", type: "info" });
    const [initError, setInitError] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    // Menyimpan barcode container asli jika user scan (untuk ditampilkan sebagai info)
    const [scannedBarcodeInfo, setScannedBarcodeInfo] = useState(null);

    // Phase: 'input' | 'scanning' | 'completed'
    const phase = !nopick ? "input" : sortingData?.header?.status === "completed" && !forceScanning ? "completed" : "scanning";

    const scanInputRef = useRef(null);
    const listRef = useRef(null);

    // Auto focus scan input when entering scanning phase
    useEffect(() => {
        if (phase === "scanning") {
            setTimeout(() => scanInputRef.current?.focus(), 400);
        }
    }, [phase]);

    // Derived data
    const header = sortingData?.header || {};
    const details = sortingData?.details || [];

    const filteredDetails = details.filter((d) => {
        const isSc = d.is_scanned === true;
        if (filterTab === "scanned") return isSc;
        if (filterTab === "pending") return !isSc;
        return true; // 'all'
    });

    const totalCount = details.length;
    const scannedCount = details.filter((d) => d.is_scanned === true).length;
    const progress = calcProgress(scannedCount, totalCount);
    const allScanned = totalCount > 0 && scannedCount === totalCount;

    // ── Handlers ────────────────────────────────────────────────────────────────

    const handleInitSorting = useCallback(
        async (rawInput) => {
            setInitError(null);

            // Deteksi apakah input adalah barcode container 13 digit atau nomor pick langsung
            const { nopick: extractedNopick, isFromBarcode, originalBarcode } = extractNopickFromInput(rawInput);

            // Simpan info barcode untuk ditampilkan ke user (jika scan barcode)
            setScannedBarcodeInfo(isFromBarcode ? originalBarcode : null);

            const result = await checkPreviewNopick(extractedNopick);
            if (!result.success) {
                setInitError(
                    isFromBarcode
                        ? `Barcode ${originalBarcode} → Nomor pick "${extractedNopick}" tidak ditemukan`
                        : result.message,
                );
            } else {
                if (result.source === "wms") {
                    // Data sudah ada di WMS (proses pernah berjalan/selesai), langsung resume
                    const initResult = await initSorting(extractedNopick, result);
                    if (!initResult.success) {
                        setInitError(initResult.message);
                    }
                } else {
                    // Data baru dari DPD, tampilkan preview konfirmasi
                    setPreviewData({ nopick: extractedNopick, ...result });
                }
            }
        },
        [checkPreviewNopick, initSorting],
    );

    const handleStartSorting = useCallback(async () => {
        if (!previewData) return;
        const { nopick } = previewData;
        const result = await initSorting(nopick, previewData);
        if (!result.success) {
            setInitError(result.message);
        }
        setPreviewData(null);
    }, [previewData, initSorting]);

    const handleScan = useCallback(async () => {
        let dusno = scanInput.trim();
        if (!dusno) return;

        // Jika barcode yang di-scan memiliki 13 digit, hapus 1 karakter terakhir 
        // agar cocok dengan format database (12 digit)
        if (dusno.length === 13) {
            dusno = dusno.slice(0, -1);
        }

        setScanInput("");
        Keyboard.dismiss();

        // Cek apakah sudah terscan
        const existing = details.find((d) => (d.dusno || d.DusNo || "").toString().trim() === dusno);
        if (existing && existing.is_scanned === true) {
            setSnackbar({
                visible: true,
                message: `Container ${dusno} sudah pernah discan`,
                type: "warning",
            });
            setTimeout(() => scanInputRef.current?.focus(), 300);
            return;
        }

        const result = await scanContainer(dusno);
        if (result.success) {
            setSnackbar({
                visible: true,
                message: `✓ Container ${dusno} berhasil discan`,
                type: "success",
            });
            // Scroll ke item yang baru discan
            setTimeout(() => {
                scanInputRef.current?.focus();
            }, 300);
        } else {
            setSnackbar({
                visible: true,
                message: result.message || "Container tidak ditemukan",
                type: "error",
            });
            setTimeout(() => scanInputRef.current?.focus(), 300);
        }
    }, [scanInput, scanContainer, details]);

    const handleComplete = useCallback(async () => {
        setShowComplete(false);
        const result = await completeProcess();
        if (result.success) {
            setForceScanning(false);
            setSnackbar({
                visible: true,
                message: "Proses sortasi berhasil diselesaikan!",
                type: "success",
            });
        } else {
            setSnackbar({
                visible: true,
                message: result.message || "Gagal menyelesaikan proses",
                type: "error",
            });
        }
    }, [completeProcess]);

    const handleReset = useCallback(() => {
        setShowReset(false);
        setForceScanning(false);
        setInitError(null);
        setScanInput("");
        resetSorting();
    }, [resetSorting]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (nopick) {
            await initSorting(nopick);
        }
        setRefreshing(false);
        setTimeout(() => {
            if (phase === "scanning") {
                scanInputRef.current?.focus();
            }
        }, 400);
    }, [nopick, initSorting, phase]);

    // ── Render ──────────────────────────────────────────────────────────────────

    // Loading full-screen (hanya muncul jika bukan di phase input)
    // Saat phase input, komponen form (Cek Nomor Pick) sudah memiliki loading statenya sendiri.
    if (isLoadingInit && !sortingData && phase !== "input") {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Sorting Pool System</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
                <LoadingView message="Memuat data..." />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color={Colors.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Sorting Pool System</Text>
                    {nopick && <Text style={styles.headerSubtitle}>Nopick: {nopick}</Text>}
                </View>
                {nopick && (
                    <TouchableOpacity onPress={() => setShowReset(true)} style={styles.headerAction}>
                        <Icon name="refresh" size={22} color={Colors.white} />
                    </TouchableOpacity>
                )}
                {!nopick && <View style={{ width: 40 }} />}
            </View>

            {/* ── Phase: Input ── */}
            {phase === "input" && (
                <PhaseInput
                    onSubmit={handleInitSorting}
                    isLoading={isLoadingInit}
                    error={initError}
                    onReset={() => setInitError(null)}
                    previewData={previewData}
                    onStartSorting={handleStartSorting}
                    onCancelPreview={() => {
                        setPreviewData(null);
                        setScannedBarcodeInfo(null);
                    }}
                    scannedBarcode={scannedBarcodeInfo}
                />
            )}

            {/* ── Phase: Scanning ── */}
            {phase === "scanning" && (
                <View style={styles.flex}>
                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={styles.progressLabel}>Progress Scan</Text>
                                <Text style={styles.progressDetail}>
                                    {scannedCount} dari {totalCount} container
                                </Text>
                            </View>
                            <View style={styles.progressBadge}>
                                <Text style={styles.progressPct}>{progress}%</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }, allScanned && { backgroundColor: Colors.success }]} />
                        </View>
                        <View style={{ marginTop: Spacing.sm, gap: 4 }}>
                            <Text style={styles.progressToko} numberOfLines={1}>
                                <Icon name="store" size={14} color={Colors.textSecondary} /> {header.toko || header.NoToko || header.Toko || "-"} - {header.tokoname || header.TOK_NAME || "-"}
                            </Text>
                            <View style={{ flexDirection: "row", gap: Spacing.md }}>
                                <Text style={styles.progressToko}>
                                    <Icon name="calendar" size={14} color={Colors.textSecondary} />
                                    {" Pick: "}
                                    {header.tglpic || header.TglPic ? formatDate(header.tglpic || header.TglPic, "date") : "-"}
                                </Text>
                                <Text style={styles.progressToko}>
                                    <Icon name="door" size={14} color={Colors.textSecondary} />
                                    {" Gate: "}
                                    {header.gate || header.Gate || "-"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Scan Input */}
                    <View style={styles.scanSection}>
                        <View style={[styles.scanInputWrap, isLoadingScan && { borderColor: Colors.accent }]}>
                            <Icon name="barcode-scan" size={22} color={Colors.primary} style={styles.scanInputIcon} />
                            <TextInput
                                ref={scanInputRef}
                                style={styles.scanInput}
                                placeholder="Scan / ketik nomor container..."
                                placeholderTextColor={Colors.gray300}
                                value={scanInput}
                                onChangeText={setScanInput}
                                autoCapitalize="characters"
                                returnKeyType="done"
                                onSubmitEditing={handleScan}
                                editable={!isLoadingScan && !refreshing}
                            />
                            {isLoadingScan ? (
                                <View style={styles.scanSpinner}>
                                    <Icon name="loading" size={18} color={Colors.accent} />
                                </View>
                            ) : (
                                scanInput.length > 0 && (
                                    <TouchableOpacity onPress={handleScan} style={styles.scanSendBtn} disabled={refreshing}>
                                        <Icon name="arrow-right-circle" size={28} color={refreshing ? Colors.gray300 : Colors.primary} />
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>

                    {/* Filter Tabs */}
                    <View style={{ flexDirection: "row", paddingHorizontal: Spacing.base, paddingTop: Spacing.md, gap: Spacing.xs }}>
                        {["all", "pending", "scanned"].map((tab) => {
                            const isActive = filterTab === tab;
                            const label = tab === "all" ? "Semua" : tab === "pending" ? "Belum Scan" : "Sudah Scan";
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setFilterTab(tab)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 8,
                                        alignItems: "center",
                                        backgroundColor: isActive ? Colors.primary : Colors.gray100,
                                        borderRadius: BorderRadius.md,
                                        borderWidth: 1,
                                        borderColor: isActive ? Colors.primary : Colors.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: FontSize.xs,
                                            fontWeight: isActive ? FontWeight.bold : FontWeight.medium,
                                            color: isActive ? Colors.white : Colors.textSecondary,
                                        }}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Container List */}
                    <FlatList
                        ref={listRef}
                        data={filteredDetails}
                        keyExtractor={(item, idx) => (item.dusno || item.DusNo || idx).toString()}
                        renderItem={({ item, index }) => <ContainerItem item={item} index={index} />}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
                        ListEmptyComponent={<EmptyState icon="package-variant-closed" title="Tidak Ada Container" description="Data container untuk nopick ini kosong" />}
                    />

                    {/* Complete Button */}
                    <View style={styles.completeSection}>
                        {!allScanned && (
                            <Text style={styles.completeHint}>
                                <Icon name="information-outline" size={14} color={Colors.textSecondary} />
                                {`  ${totalCount - scannedCount} container belum discan`}
                            </Text>
                        )}
                        <Button
                            title={allScanned ? "Selesaikan Sortasi" : "Force Complete"}
                            onPress={() => setShowComplete(true)}
                            variant={allScanned ? "success" : "outline"}
                            fullWidth
                            size="lg"
                            iconRight="check-circle"
                            disabled={isCompleting || refreshing}
                            loading={isCompleting}
                        />
                    </View>
                </View>
            )}

            {/* ── Phase: Completed ── */}
            {phase === "completed" && (
                <ScrollView contentContainerStyle={styles.completedWrap} showsVerticalScrollIndicator={false}>
                    <View style={styles.completedCard}>
                        <View style={styles.completedIcon}>
                            <Icon name="check-circle" size={64} color={Colors.success} />
                        </View>
                        <Text style={styles.completedTitle}>Penyortiran Selesai!</Text>
                        <Text style={styles.completedSubtitle}>
                            Proses penyortiran barang atas nomor pick <Text style={styles.completedNopick}>{nopick}</Text> telah berhasil diselesaikan.
                        </Text>

                        {/* Summary */}
                        <View style={styles.completedSummary}>
                            <View style={styles.completedSummaryItem}>
                                <Text style={styles.completedSummaryValue}>{scannedCount}</Text>
                                <Text style={styles.completedSummaryLabel}>Terscan</Text>
                            </View>
                            <View style={styles.completedSummaryDivider} />
                            <View style={styles.completedSummaryItem}>
                                <Text style={styles.completedSummaryValue}>{totalCount}</Text>
                                <Text style={styles.completedSummaryLabel}>Total</Text>
                            </View>
                            <View style={styles.completedSummaryDivider} />
                            <View style={styles.completedSummaryItem}>
                                <Text style={styles.completedSummaryValue}>{progress}%</Text>
                                <Text style={styles.completedSummaryLabel}>Progress</Text>
                            </View>
                        </View>

                        <Button title="Mulai Nopick Baru" onPress={handleReset} variant="primary" fullWidth size="lg" iconLeft="plus-circle" style={styles.completedBtn} />
                        <Button title="Proses Scan Ulang" onPress={() => setForceScanning(true)} variant="outline" fullWidth size="md" iconLeft="barcode-scan" style={{ marginTop: Spacing.sm }} />
                        <Button
                            title="Kembali ke Beranda"
                            onPress={() => {
                                handleReset();
                                navigation.goBack();
                            }}
                            variant="outline"
                            fullWidth
                            size="md"
                            style={{ marginTop: Spacing.sm }}
                        />
                    </View>
                </ScrollView>
            )}

            {/* ── Dialogs ── */}
            <ConfirmDialog
                visible={showComplete}
                onClose={() => setShowComplete(false)}
                onConfirm={handleComplete}
                title="Selesaikan Sortasi"
                message={
                    allScanned
                        ? `Semua ${totalCount} container telah terscan. Yakin ingin menyelesaikan proses sortasi nopick "${nopick}"?`
                        : `Baru ${scannedCount} dari ${totalCount} container yang terscan. Apakah Anda yakin ingin force complete?`
                }
                confirmLabel="Ya, Selesaikan"
                confirmVariant="primary"
                type={allScanned ? "success" : "warning"}
                isLoading={isCompleting}
            />

            <ConfirmDialog
                visible={showReset}
                onClose={() => setShowReset(false)}
                onConfirm={handleReset}
                title="Mulai Ulang"
                message="Apakah Anda ingin keluar dari nopick ini dan mulai dengan nopick baru? Proses yang sudah berjalan tidak akan dihapus."
                confirmLabel="Ya, Ganti Nopick"
                confirmVariant="primary"
                type="warning"
            />

            <Snackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                duration={snackbar.type === "success" ? 2000 : 3500}
                onDismiss={() => setSnackbar((p) => ({ ...p, visible: false }))}
            />
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    flex: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingTop: Spacing.lg + 8,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.base,
        gap: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: "rgba(255,255,255,0.7)",
        marginTop: 2,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
    },

    // Phase Input
    phaseInputWrap: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Spacing.lg,
    },
    phaseInputCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius["2xl"],
        padding: Spacing.xl,
        alignItems: "center",
        ...Shadow.lg,
    },
    phaseInputIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.gray50,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    phaseInputTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        textAlign: "center",
    },
    phaseInputSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    nopickInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1.5,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        marginBottom: Spacing.sm,
    },
    nopickInputIcon: { paddingHorizontal: Spacing.base },
    nopickInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        paddingVertical: Spacing.md,
        letterSpacing: 1,
    },
    clearBtn: { paddingHorizontal: Spacing.sm },
    phaseInputError: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: Spacing.sm,
        width: "100%",
    },
    phaseInputErrorText: {
        fontSize: FontSize.sm,
        color: Colors.error,
        flex: 1,
    },
    phaseInputBtn: { marginTop: Spacing.sm },

    // Progress Section
    progressSection: {
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Spacing.sm,
    },
    progressLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
    },
    progressDetail: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    progressBadge: {
        backgroundColor: Colors.primary + "15",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    progressPct: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.gray100,
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: Colors.accent,
        borderRadius: 4,
    },
    progressToko: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },

    // Scan Input Section
    scanSection: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.gray50,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    scanInputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: Colors.border,
        paddingRight: Spacing.xs,
        ...Shadow.sm,
    },
    scanInputIcon: { paddingHorizontal: Spacing.base },
    scanInput: {
        flex: 1,
        fontSize: FontSize.base,
        color: Colors.textPrimary,
        paddingVertical: Spacing.md,
        letterSpacing: 1,
    },
    scanSpinner: { paddingHorizontal: Spacing.sm },
    scanSendBtn: { paddingHorizontal: Spacing.xs },

    // Container List
    listContent: {
        padding: Spacing.base,
        gap: Spacing.sm,
        paddingBottom: Spacing["2xl"],
    },
    containerItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.md,
        ...Shadow.xs,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    containerItemScanned: {
        borderColor: Colors.successLight,
        backgroundColor: Colors.successBg,
    },
    containerSeq: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    containerSeqText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    containerInfo: { flex: 1 },
    containerDusno: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    containerMeta: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    containerTime: {
        fontSize: 10,
        color: Colors.gray400,
        marginTop: 2,
    },
    containerStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    containerStatusText: {
        fontSize: 10,
        fontWeight: FontWeight.semiBold,
    },

    // Complete Section
    completeSection: {
        backgroundColor: Colors.white,
        padding: Spacing.base,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: Spacing.xs,
    },
    completeHint: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: Spacing.xs,
    },

    // Completed Phase
    completedWrap: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Spacing.lg,
    },
    completedCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius["2xl"],
        padding: Spacing.xl,
        alignItems: "center",
        ...Shadow.lg,
    },
    completedIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.successBg,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.lg,
    },
    completedTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extraBold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    completedSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    completedNopick: {
        color: Colors.primary,
        fontWeight: FontWeight.bold,
    },
    completedSummary: {
        flexDirection: "row",
        backgroundColor: Colors.gray50,
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
        marginBottom: Spacing.xl,
        width: "100%",
        justifyContent: "center",
    },
    completedSummaryItem: {
        flex: 1,
        alignItems: "center",
    },
    completedSummaryValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    completedSummaryLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    completedSummaryDivider: {
        width: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.xs,
    },
    completedBtn: { marginTop: Spacing.sm },
});

export default SortingPoolScreen;

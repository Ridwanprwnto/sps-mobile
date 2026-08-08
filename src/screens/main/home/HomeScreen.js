// src/screens/main/home/HomeScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from "react-native";
import Icon from "@react-native-vector-icons/material-design-icons";
import Config from "react-native-config";
import { Card, ConfirmDialog, Snackbar } from "../../../components";
import { useAuthStore, useSortingStore } from "../../../store";
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from "../../../constants";
import { formatDate } from "../../../utils";

// ─── Sub Components ──────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, icon, color, bg }) => (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
        <View style={[styles.summaryIcon, { backgroundColor: color + "22" }]}>
            <Icon name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.summaryValue, { color }]}>{value ?? "-"}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const QuickMenu = ({ icon, label, color, bg, onPress }) => (
    <TouchableOpacity style={[styles.menuCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.menuIconWrap, { backgroundColor: color }]}>
            <Icon name={icon} size={28} color={Colors.white} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();
    const { sortingData } = useSortingStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: "",
        type: "info",
    });

    const onRefresh = async () => {
        setRefreshing(true);
        // Tidak ada dashboard data untuk SPS, hanya refresh tampilan
        setTimeout(() => setRefreshing(false), 800);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        setLoggingOut(false);
        setShowLogout(false);
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    // Hitung summary dari sortingData aktif (jika ada)
    const activeSortingNopick = sortingData?.header?.nopick || null;
    const detailsCount = sortingData?.details?.length || 0;
    const scannedCount = sortingData?.details?.filter((d) => d.is_scanned === true).length || 0;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerDecor} />
                <View style={styles.headerDecor2} />
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.greeting}>{greeting()},</Text>
                            <Text style={styles.userName}>{(user?.username || "Operator").toUpperCase()}</Text>
                            <View style={styles.roleBadge}>
                                <Icon name="shield-account" size={12} color={Colors.accentLight} />
                                <Text style={styles.roleText}>{user?.groupName || "Operator"}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.avatarBtn} onPress={() => setShowLogout(true)}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{(user?.username || "U")[0].toUpperCase()}</Text>
                            </View>
                            <View style={styles.onlineDot} />
                        </TouchableOpacity>
                    </View>

                    {/* Summary Cards */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll} contentContainerStyle={styles.summaryContent}>
                        <SummaryCard label="Nopick Aktif" value={activeSortingNopick || "-"} icon="barcode-scan" color={Colors.white} bg="rgba(255,255,255,0.15)" />
                        <SummaryCard label="Total Container" value={detailsCount || "-"} icon="package-variant" color={Colors.white} bg="rgba(255,255,255,0.15)" />
                        <SummaryCard label="Terscan" value={detailsCount > 0 ? `${scannedCount}/${detailsCount}` : "-"} icon="check-circle" color={Colors.white} bg="rgba(255,255,255,0.15)" />
                    </ScrollView>
                </View>
            </View>

            {/* ── Body ── */}
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}>
                {/* Quick Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Utama</Text>
                    <View style={styles.menuGrid}>
                        <QuickMenu icon="sort-variant" label="Proses Sortasi" color={Colors.primary} bg={Colors.gray50} onPress={() => navigation.navigate("SortingPool")} />
                        <QuickMenu
                            icon="cog"
                            label="Pengaturan"
                            color={Colors.gray500}
                            bg={Colors.gray100}
                            onPress={() =>
                                setSnackbar({
                                    visible: true,
                                    message: "Fitur segera hadir",
                                    type: "info",
                                })
                            }
                        />
                    </View>
                </View>

                {/* Panduan Singkat */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Panduan Proses Sortasi</Text>
                    <Card style={styles.guideCard} padding="md" shadow="sm">
                        {[
                            {
                                step: "1",
                                icon: "barcode",
                                text: "Periksa nomor pick dengan melakukan input atau scan",
                                color: Colors.accent,
                            },
                            {
                                step: "2",
                                icon: "package-variant-closed",
                                text: "Memulai/melanjutkan proses sortasi dengan melakukan scan dusno/nomor container terpakai",
                                color: Colors.warning,
                            },
                            {
                                step: "3",
                                icon: "check-circle-outline",
                                text: "Tekan Complete untuk menyelesaikan proses sortasi",
                                color: Colors.success,
                            },
                        ].map((item) => (
                            <View key={item.step} style={styles.guideRow}>
                                <View style={[styles.guideStepBadge, { backgroundColor: item.color + "22" }]}>
                                    <Icon name={item.icon} size={18} color={item.color} />
                                </View>
                                <Text style={styles.guideText}>{item.text}</Text>
                            </View>
                        ))}
                    </Card>
                </View>

                {/* Today Info */}
                <View style={[styles.section, styles.infoSection]}>
                    <View style={styles.infoRow}>
                        <Icon name="calendar-today" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{formatDate(new Date(), "long")}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{`${user?.officeCode || ""} - ${user?.deptName || ""} ${user?.officeName || ""}`.trim() || "Gudang Utama"}</Text>
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.appInfoWrap}>
                    <Icon name="sort-variant" size={14} color={Colors.gray300} />
                    <Text style={styles.appVersion}>v{Config.APP_VERSION}</Text>
                    <Text style={styles.appDot}>·</Text>
                    <Text style={styles.appCopyright}>
                        {Config.APP_COPYRIGHT} {Config.APP_DEVELOPER}
                    </Text>
                </View>

                <View style={styles.bottomPad} />
            </ScrollView>

            {/* Logout Confirm */}
            <ConfirmDialog
                visible={showLogout}
                onClose={() => setShowLogout(false)}
                onConfirm={handleLogout}
                title="Keluar Aplikasi"
                message="Apakah Anda yakin ingin keluar dari aplikasi SPS Mobile?"
                confirmLabel="Ya, Keluar"
                type="danger"
                isLoading={loggingOut}
            />

            <Snackbar visible={snackbar.visible} message={snackbar.message} type={snackbar.type} onDismiss={() => setSnackbar((p) => ({ ...p, visible: false }))} />
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    header: {
        backgroundColor: Colors.primary,
        paddingBottom: Spacing.xl,
        overflow: "hidden",
    },
    headerDecor: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: Colors.primaryLight,
        top: -90,
        right: -60,
        opacity: 0.4,
    },
    headerDecor2: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.accent,
        bottom: -50,
        left: -30,
        opacity: 0.1,
    },
    headerContent: {
        paddingTop: Spacing["2xl"] + 8,
        paddingHorizontal: Spacing.lg,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: Spacing.lg,
    },
    headerLeft: { flex: 1 },
    greeting: {
        fontSize: FontSize.sm,
        color: "rgba(255,255,255,0.7)",
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.white,
        marginTop: 2,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    roleText: {
        fontSize: FontSize.xs,
        color: Colors.gray100,
        fontWeight: FontWeight.medium,
    },
    avatarBtn: { position: "relative" },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
    },
    avatarText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    onlineDot: {
        position: "absolute",
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.success,
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    summaryScroll: { marginHorizontal: -Spacing.lg },
    summaryContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        paddingRight: Spacing.lg,
    },
    summaryCard: {
        minWidth: 120,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
        alignItems: "center",
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.xs,
    },
    summaryValue: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.extraBold,
    },
    summaryLabel: {
        fontSize: 10,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        marginTop: 2,
    },
    body: { flex: 1 },
    section: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    menuGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: Spacing.sm,
    },
    menuCard: {
        width: "47.5%",
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
        alignItems: "center",
        ...Shadow.xs,
    },
    menuIconWrap: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },
    menuLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semiBold,
        color: Colors.textPrimary,
        textAlign: "center",
    },
    guideCard: {
        gap: Spacing.md,
    },
    guideRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    guideStepBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    guideText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    infoSection: {
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
        ...Shadow.xs,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginBottom: 6,
    },
    infoText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    appInfoWrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexWrap: "wrap",
    },
    appVersion: { fontSize: FontSize.xs, color: Colors.gray300 },
    appDot: { fontSize: FontSize.xs, color: Colors.gray300 },
    appCopyright: { fontSize: FontSize.xs, color: Colors.gray300 },
    bottomPad: { height: Spacing["3xl"] },
});

export default HomeScreen;

// src/screens/auth/login/LoginScreen.js
import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    StatusBar,
    Image,
} from "react-native";

const logo = require('../../../assets/images/logo.png');
import Icon from "@react-native-vector-icons/material-design-icons";
import Config from "react-native-config";
import { Button, Input, Snackbar } from "../../../components";
import { useAuthStore } from "../../../store";
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from "../../../constants";

const LoginScreen = () => {
    const { login, isLoading, error, clearError } = useAuthStore();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: "",
        type: "error",
    });

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const validate = () => {
        const errors = {};
        if (!username.trim()) errors.username = "Username wajib diisi";
        if (!password.trim()) errors.password = "Password wajib diisi";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) {
            shake();
            return;
        }
        clearError();
        const result = await login(username.trim(), password);
        if (!result.success) {
            shake();
            setSnackbar({ visible: true, message: result.message, type: "error" });
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Background Decoration */}
            <View style={styles.bgTop}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    {/* Logo & Brand */}
                    <View style={styles.brandWrap}>
                        <View style={styles.logoBox}>
                            <Image
                                source={logo}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appName}>SPS Mobile</Text>
                        <Text style={styles.appTagline}>Sorting Pool System</Text>
                    </View>

                    {/* Card Form */}
                    <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
                        <Text style={styles.cardTitle}>Selamat Datang</Text>
                        <Text style={styles.cardSubtitle}>
                            Masuk dengan akun Anda untuk memulai proses penyortiran container barang.
                        </Text>

                        <View style={styles.form}>
                            <Input
                                label="Account"
                                placeholder="Masukkan nik/username"
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: "" }));
                                }}
                                iconLeft="account"
                                autoCapitalize="none"
                                error={fieldErrors.username}
                                required
                            />

                            <Input
                                label="Password"
                                placeholder="Masukkan password"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                                }}
                                iconLeft="lock"
                                secureTextEntry
                                error={fieldErrors.password}
                                required
                            />

                            <Button
                                title="Login"
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={isLoading}
                                fullWidth
                                size="lg"
                                iconRight="arrow-right"
                                style={styles.loginBtn}
                            />
                        </View>

                        {/* Info */}
                        <View style={styles.infoRow}>
                            <Icon name="shield-check" size={14} color={Colors.success} />
                            <Text style={styles.infoText}>Koneksi terenkripsi & aman</Text>
                        </View>
                    </Animated.View>

                    {/* Version */}
                    <Text style={styles.version}>v{Config.APP_VERSION}</Text>

                    {/* Copyright */}
                    <Text style={styles.copyright}>
                        {Config.APP_COPYRIGHT} {Config.APP_DEVELOPER}
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>

            <Snackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                onDismiss={() => setSnackbar((p) => ({ ...p, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    flex: { flex: 1 },
    bgTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "55%",
        backgroundColor: Colors.primary,
        overflow: "hidden",
    },
    circle1: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: Colors.primaryLight,
        top: -80,
        right: -60,
        opacity: 0.5,
    },
    circle2: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.accent,
        top: 60,
        left: -70,
        opacity: 0.15,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing["3xl"],
    },
    brandWrap: {
        alignItems: "center",
        marginBottom: Spacing["2xl"],
    },
    logoBox: {
        width: 110,
        height: 110,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
        overflow: "hidden",
    },
    logoImage: {
        width: 110,
        height: 110,
    },
    appName: {
        fontSize: FontSize["3xl"],
        fontWeight: FontWeight.extraBold,
        color: Colors.white,
        letterSpacing: 1,
    },
    appTagline: {
        fontSize: FontSize.md,
        color: "rgba(255,255,255,0.7)",
        marginTop: 4,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius["2xl"],
        padding: Spacing.xl,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    cardTitle: {
        fontSize: FontSize["2xl"],
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    form: {
        gap: Spacing.md,
    },
    loginBtn: {
        marginTop: Spacing.sm,
        borderRadius: BorderRadius.lg,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.lg,
        gap: 5,
    },
    infoText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    version: {
        textAlign: "center",
        fontSize: FontSize.xs,
        color: "rgba(255,255,255,0.5)",
        marginTop: Spacing.xl,
    },
    copyright: {
        textAlign: "center",
        fontSize: FontSize.xs,
        color: "rgba(255,255,255,0.5)",
        marginTop: Spacing.xs,
    },
});

export default LoginScreen;

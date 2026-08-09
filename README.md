# SPS Mobile (Sorting Pool System)

Aplikasi **SPS Mobile (Sorting Pool System)** adalah aplikasi mobile berbasis Android yang dikembangkan menggunakan **React Native**. Aplikasi ini ditujukan untuk memfasilitasi petugas gudang/logistik (operator) dalam proses penyortiran barang (sortasi) berdasarkan nomor pick atau container.

## 📱 Fitur Utama

- **Autentikasi & Sesi Aman**: Login operator terenkripsi dengan manajemen sesi lokal (Token-based authentication).
- **Dashboard Profil**: Tampilan sapaan pengguna, ID pengguna, dan grup/role secara dinamis.
- **Proses Penyortiran (3 Fase)**:
  1. **Cek Nomor Pick**: Validasi nomor pick/container ke server sebelum memulai proses pemindaian.
  2. **Scan Item**: Antarmuka pemindaian barcode dengan fitur input manual, perhitungan progres (Scanned vs Total), dan tampilan *List Item* yang dikelompokkan ke dalam tab (Scanned, Pending, All).
  3. **Penyortiran Selesai**: Ringkasan penyortiran jika semua barang pada nomor pick tersebut berhasil dipindai seluruhnya.
- **Auto Focus & Swipe-to-Refresh**: Alur kerja yang intuitif (UX) dengan *auto-focus* pada kolom input scan dan dukungan *pull-to-refresh*.
- **Native Splash Screen**: Transisi *Bootsplash* yang mulus dan modern menyesuaikan native OS (Android 12+ API).
- **Multiple Environment**: Dukungan untuk konfigurasi *Local, Development, Test,* dan *Production* menggunakan file `.env`.

## 🛠 Teknologi & Library

Proyek ini dibangun di atas fondasi teknologi modern:

- **Framework**: [React Native](https://reactnative.dev/) (v0.75.5) / React (v18.3.1)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Ringan, cepat, dan modern)
- **Navigasi**: [React Navigation v6](https://reactnavigation.org/) (Native Stack)
- **API Client**: [Axios](https://axios-http.com/)
- **Penyimpanan Lokal**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- **UI & Ikon**: 
  - [React Native Paper](https://callstack.github.io/react-native-paper/)
  - [@react-native-vector-icons/material-design-icons](https://github.com/oblador/react-native-vector-icons)
- **Environment**: [react-native-config](https://github.com/lugg/react-native-config)
- **Native Splash Screen**: [react-native-bootsplash](https://github.com/zoontek/react-native-bootsplash) (v7.3.2)
- **Sistem File & Logging**: `react-native-fs`, `react-native-logs`

## 📂 Struktur Direktori

```text
SPS/
├── android/                   # Konfigurasi Native Android (Gradle, Manifest, Res, dll)
├── assets/                    # Aset build seperti logo bootsplash generator
├── src/                       # Source Code Utama React Native
│   ├── assets/                # Gambar, logo, ikon (misal: src/assets/images)
│   ├── components/            # Reusable UI Components (Button, Input, Snackbar, Loading)
│   ├── constants/             # Konfigurasi Tema (Colors, Spacing, Typography)
│   ├── navigation/            # Pengaturan Rute (AppStack, MainStack, AuthStack)
│   ├── screens/               # Komponen Layar / Halaman
│   │   ├── auth/              # Layar terkait Autentikasi (LoginScreen)
│   │   └── main/              # Layar Utama
│   │       ├── home/          # HomeScreen (Dashboard)
│   │       └── sortingpool/   # SortingPoolScreen (Proses Scan & Sortasi)
│   ├── services/              # Modul untuk memanggil REST API (Axios API interface)
│   └── store/                 # State Management menggunakan Zustand (authStore, dll)
├── App.js                     # Root Component
├── index.js                   # Entry point React Native
├── package.json               # Dependensi & NPM Scripts
└── .env.*                     # Konfigurasi Environment API & Variabel Konstan
```

## 🚀 Panduan Menjalankan (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Pilih Environment** (Opsional, bawaan menggunakan `.env` yang disalin):
   ```bash
   npm run env:local
   ```
3. **Jalankan Metro Bundler**:
   ```bash
   npm start
   ```
4. **Jalankan di Emulator / Perangkat Android**:
   ```bash
   npm run android
   ```

## 📦 Build untuk Rilis (Production)

Untuk melakukan build APK rilis yang akan didistribusikan:
1. Pastikan *signing config* dan *keystore* sudah diatur dengan benar di `android/app/build.gradle`.
2. Bersihkan *build cache* (opsional tetapi disarankan):
   ```bash
   cd android && ./gradlew clean
   ```
3. Buat file APK Release:
   ```bash
   ./gradlew assembleRelease
   ```
4. File `.apk` akan dihasilkan di direktori `android/app/build/outputs/apk/release/app-release.apk`.

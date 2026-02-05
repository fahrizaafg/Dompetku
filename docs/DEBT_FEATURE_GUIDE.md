# Panduan Pengguna Fitur Hutang (Debt Tracker)

## Ringkasan
Fitur Debt Tracker di Dompetku telah diperbarui secara menyeluruh untuk membantu Anda mengelola hutang dan piutang dengan lebih efisien, transparan, dan mudah.

## Fitur Utama

### 1. Dashboard Hutang
- **Total Balance**: Melihat selisih antara total piutang (uang yang dipinjamkan) dan hutang (uang yang dipinjam).
- **Indikator Visual**: Progress bar menunjukkan rasio hutang Anda terhadap batas aman.
- **Daftar Interaktif**: Kartu hutang menampilkan sisa hutang, progress pembayaran, dan status lunas secara real-time.

### 2. Menambah Catatan Baru
1. Tekan tombol **(+)** di pojok kanan bawah.
2. Pilih tipe: **I Owe (Hutang)** atau **Owes Me (Piutang)**.
3. Masukkan jumlah, nama orang, tanggal jatuh tempo (opsional), dan catatan.
4. Tekan **Save Record**.
5. **Otomatisasi**: Saldo utama Anda akan otomatis disesuaikan (bertambah jika hutang, berkurang jika piutang).

### 3. Mencatat Pembayaran (Partial Payment)
Anda tidak perlu membayar lunas sekaligus. Anda bisa mencatat cicilan:
1. Klik pada salah satu kartu hutang di daftar.
2. Di halaman detail, tekan tombol **Record Payment**.
3. Masukkan jumlah yang dibayar (tidak boleh melebihi sisa hutang).
4. Masukkan tanggal dan catatan tambahan (misal: "Transfer BCA").
5. Tekan **Confirm Payment**.
6. **Otomatisasi**: Transaksi pembayaran akan tercatat di History dan saldo utama akan disesuaikan.

### 4. Detail & Riwayat
Klik kartu hutang untuk melihat:
- **Timeline Pembayaran**: Riwayat lengkap setiap pembayaran yang pernah dilakukan.
- **Estimasi Lunas**: Prediksi kapan hutang akan lunas berdasarkan rata-rata pembayaran Anda.
- **Progress Bar**: Persentase pelunasan visual.

### 5. Filter & Sorting
- **Filter**: Gunakan ikon "Tune" untuk memfilter berdasarkan Status (Lunas/Belum) atau Rentang Tanggal.
- **Sorting**: Urutkan berdasarkan Tanggal atau Jumlah Hutang.

### 6. Strategi Pelunasan (Smart Payoff)
Gunakan fitur "Smart Payoff Strategy" di bagian atas dashboard untuk menghitung:
- Berapa lama hutang lunas jika Anda membayar Rp X per bulan.
- Berapa yang harus dibayar per bulan jika ingin lunas pada tanggal tertentu.

## Tips
- Gunakan fitur ini untuk menjaga rasio hutang Anda tetap sehat.
- Selalu catat setiap pembayaran kecil agar data tetap akurat.
- Periksa notifikasi untuk konfirmasi saat hutang telah lunas sepenuhnya.

---

## Technical Documentation (Sinkronisasi Data)

### Alur Sinkronisasi (Data Flow)
Sistem menggunakan **React Context API** untuk memastikan konsistensi data antara modul Hutang (`DebtContext`) dan Keuangan Utama (`UserContext`).

1. **Penambahan Hutang (Add Debt)**
   - **Input**: User menambahkan hutang baru sebesar Rp X.
   - **Process**: 
     - Data hutang tersimpan di `DebtContext`.
     - `DebtContext` memanggil `UserContext.addTransaction()`.
   - **Output**:
     - Jika Tipe `DEBT` (Hutang): Membuat transaksi **INCOME** (Saldo bertambah).
     - Jika Tipe `RECEIVABLE` (Piutang): Membuat transaksi **EXPENSE** (Saldo berkurang).

2. **Pembayaran Hutang (Add Payment)**
   - **Input**: User mencatat pembayaran sebesar Rp Y.
   - **Process**:
     - Data pembayaran ditambahkan ke array `payments` di `DebtContext`.
     - `DebtContext` memanggil `UserContext.addTransaction()`.
   - **Output**:
     - Jika Tipe `DEBT`: Membuat transaksi **EXPENSE** (Pelunasan mengurangi saldo).
     - Jika Tipe `RECEIVABLE`: Membuat transaksi **INCOME** (Penerimaan piutang menambah saldo).

### API Reference (Context Methods)

#### `DebtContext`
*   **`addDebt(debt: Omit<Debt, "id" ...>)`**: Menambah record hutang dan memicu sinkronisasi transaksi.
*   **`addPayment(debtId: string, payment: Omit<Payment, "id">)`**: Mencatat pembayaran dan memicu sinkronisasi transaksi.

#### `UserContext`
*   **`addTransaction(transaction: Omit<Transaction, "id">)`**: Menambah record ke `History` dan memperbarui `Total Balance` di Dashboard.

### Validasi Data
- **Timestamp**: Menggunakan format ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) untuk presisi waktu.
- **Logic**: Mencegah pembayaran melebihi sisa hutang.
- **Consistency**: Menggunakan `useEffect` dan state management untuk memastikan UI selalu reaktif terhadap perubahan data.

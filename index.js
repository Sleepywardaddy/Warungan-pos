//firebase db


// 1. Inisialisasi status mute saat aplikasi pertama kali dimuat
let isMuted = localStorage.getItem('appMuted') === 'true';

function playSound(fileName) {
    if (isMuted) return; // Jangan bunyi kalau lagi mute
    const audio = new Audio(`assets/sounds/${fileName}`);
    audio.play().catch(e => console.log("Audio play blocked by browser"));
}

// 3. Fungsi Tombol Mute/Unmute
function toggleMute() {
    isMuted = !isMuted; // Balikkan status
    localStorage.setItem('appMuted', isMuted); // Simpan ke memori HP

    // Update tampilan tombol secara visual
    const btn = document.getElementById('mute-btn');
    if (btn) {
        btn.innerText = isMuted ? "🔇 Muted" : "🔊 Sound On";
        btn.style.background = isMuted ? "#e74c3c" : "#2ecc71";
    }
}
//ai said to put it here w the other but ig the other fine by it
let logKasMutasi = JSON.parse(localStorage.getItem('warungan_mutasi_kas')) || [];
//new feature
// --- DATABASE ---
let galonData = JSON.parse(localStorage.getItem('w_galon')) || [];
let gasData = JSON.parse(localStorage.getItem('w_gas')) || [];
let koinData = JSON.parse(localStorage.getItem('w_koin')) || [];
let targetInv = ''; // 'galon' atau 'gas'

// Simple SPA navigation for Warung POS
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.app-page').forEach(function (p) {
        p.style.display = 'none';
    });

    // Show the selected page - Change 'page' to 'targetPage'
    var targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = '';

    // Remove 'active' from all nav items
    document.querySelectorAll('.sidebar ul li').forEach(function (nav) {
        nav.classList.remove('active');
    });

    var navId = 'nav-' + pageId.replace('page-', '');
    var navItem = document.getElementById(navId);
    if (navItem) navItem.classList.add('active');

    // THIS IS THE TRIGGER - Add this so the render function actually runs!
    if (typeof pageHooks !== 'undefined' && pageHooks[pageId]) {
        pageHooks[pageId]();
    }

    if (pageId === 'page-log-mutasi' || pageId === 'page-riwayat-kas') {
        renderLogMutasi();
    }

    const sidebar = document.querySelector('.sidebar');

    // Check if sidebar exists and has the 'active' class (which means it's open)
    if (sidebar && sidebar.classList.contains('active')) {
        // We call toggleSidebar() to trigger the closing animation
        toggleSidebar();
    }
}

// Optional: Show default page on load
window.addEventListener('DOMContentLoaded', function () {
    showPage('page-saldo');
});


// Placeholder for backupData (to avoid errors if button is clicked)
function backupData() {
    // 1. Kumpulkan semua data (Lengkap dengan fitur baru)
    const data = {
        produkList,
        transaksiLog,
        piutangList,
        saldo,
        logKasMutasi, // Riwayat Kas wajib ikut
        galonData,
        gasData,
        koinData,
        waktuBackup: new Date().toLocaleString('id-ID')
    };

    // 2. Langsung ke metode Modal Teks (Bypass Blob/Base64 untuk menghindari limit APK)
    try {
        const jsonString = JSON.stringify(data);
        tampilkanModalBackupTeks(jsonString);
        console.log("Backup manual ditampilkan.");
    } catch (e) {
        alert("Gagal memproses data backup: " + e.message);
    }
}

// Fungsi Utama Tampilan Modal untuk Salin-Tempel Manual
function tampilkanModalBackupTeks(teks) {
    // Hapus modal jika sebelumnya sudah ada
    const existingModal = document.getElementById('modal-backup-manual');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-backup-manual';
    modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; justify-content:center; align-items:center; padding:20px;";

    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:15px; width:100%; max-width:500px; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="margin:0 0 10px 0; color:#2ecc71;">📦 Salin Kode Backup</h3>
            <p style="font-size:12px; color:#666; margin-bottom:15px;">Sistem APK membatasi download file. Silakan salin teks di bawah ini dan simpan di WhatsApp atau Catatan HP Juragan.</p>
            
            <textarea id="areaBackup" readonly style="width:100%; height:200px; padding:12px; border:1px solid #ddd; border-radius:8px; font-family:monospace; font-size:10px; background:#f9f9f9; line-height:1.4; color:#333;">${teks}</textarea>
            
            <button onclick="salinBackupManual()" style="width:100%; padding:14px; background:#2ecc71; color:white; border:none; border-radius:10px; margin-top:15px; font-weight:bold; cursor:pointer; font-size:16px;">
                <i class="fas fa-copy"></i> SALIN DATA
            </button>
            
            <button onclick="document.getElementById('modal-backup-manual').remove()" style="width:100%; padding:10px; background:#eee; border:none; border-radius:10px; margin-top:10px; color:#888; font-weight:bold; cursor:pointer;">TUTUP</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function salinBackupManual() {
    const area = document.getElementById('areaBackup');
    area.select();
    area.setSelectionRange(0, 99999); // Untuk mobile

    try {
        const sukses = document.execCommand('copy');
        if (sukses) {
            alert("DATA DISALIN! Segera tempel (paste) di WA atau tempat aman.");
        }
    } catch (err) {
        alert("Gagal salin otomatis, silakan tekan lama pada teks lalu pilih 'Salin Semua'.");
    }
}

// Untuk memuat data kembali (Restore)
function loadBackupData() {
    const backupInput = prompt("Tempel (Paste) kode backup Juragan di sini:");
    if (!backupInput) return;

    try {
        const data = JSON.parse(backupInput);

        // Validasi struktur data
        if (data.produkList && data.transaksiLog) {
            // Masukkan data ke variabel
            produkList = data.produkList;
            transaksiLog = data.transaksiLog;
            piutangList = data.piutangList || [];
            saldo = Number(data.saldo) || 0;
            logKasMutasi = data.logKasMutasi || [];
            galonData = data.galonData || [];
            gasData = data.gasData || [];
            koinData = data.koinData || [];

            // Simpan ke LocalStorage permanen
            localStorage.setItem('warungan_produk', JSON.stringify(produkList));
            localStorage.setItem('warungan_transaksi', JSON.stringify(transaksiLog));
            localStorage.setItem('warungan_piutang', JSON.stringify(piutangList));
            localStorage.setItem('saldo', saldo.toString());
            localStorage.setItem('warungan_mutasi_kas', JSON.stringify(logKasMutasi));
            localStorage.setItem('w_galon', JSON.stringify(galonData));
            localStorage.setItem('w_gas', JSON.stringify(gasData));
            localStorage.setItem('w_koin', JSON.stringify(koinData));

            alert('✅ Data berhasil dimuat sempurna!');
            location.reload(); // Refresh aplikasi agar data baru tampil
        } else {
            alert('❌ Kode backup tidak valid!');
        }
    } catch (err) {
        alert('❌ Error: Gagal membaca kode. Pastikan kode yang ditempel benar!');
    }
}

// --- Data Storage (in-memory, for demo) ---
let saldo = 0;
let transaksiLog = [];
let produkList = [];
let cart = [];

// --- Saldo Page ---
function updateSaldoDisplay() {
    document.getElementById('display-saldo').textContent = 'Rp ' + saldo.toLocaleString('id-ID');
    document.getElementById('dash-in').textContent = 'Rp ' + getTodayTotal('Masuk');
    document.getElementById('dash-out').textContent = 'Rp ' + getTodayTotal('Keluar');
    document.getElementById('dash-count').textContent = getTodayCount();
    if (document.getElementById('dash-piutang'))
        document.getElementById('dash-piutang').textContent = 'Rp ' + getTotalPiutang().toLocaleString('id-ID');
}

function getTodayTotal(jenis) {
    const today = new Date().toISOString().slice(0, 10);
    return transaksiLog.filter(t => t.tanggal === today && t.jenis === jenis)
        .reduce((sum, t) => sum + t.nominal, 0);
}
function getTodayCount() {
    const today = new Date().toISOString().slice(0, 10);
    return transaksiLog.filter(t => t.tanggal === today).length;
}

// --- Pemasukan/pengelluaran dompet Page ---
function prosesPemasukan() {
    const nominalInput = document.getElementById('pem-nominal').value;
    const ketInput = document.getElementById('pem-ket').value;
    const jenisInput = document.getElementById('pem-jenis').value; // Dropdown: "Masuk" atau "Keluar"

    let nominal = parseFloat(nominalInput);
    const petugasAktif = localStorage.getItem('activeUser') || "Kasir";

    if (isNaN(nominal) || nominal === 0) return alert("Masukkan nominal!");
    if (!ketInput) return alert("Isi keterangan!");

    // --- LOGIKA SAKTI DROPDOWN ---
    // Jika dropdown pilih 'Keluar', paksa nominal jadi negatif agar memotong saldo
    if (jenisInput === 'Keluar' && nominal > 0) {
        nominal = -Math.abs(nominal);
    } else if (jenisInput === 'Masuk' && nominal < 0) {
        nominal = Math.abs(nominal); // Jika tak sengaja ketik minus di Kas Masuk, jadi plus
    }

    const sekarang = new Date();
    const jamMenit = sekarang.getHours().toString().padStart(2, '0') + ":" + sekarang.getMinutes().toString().padStart(2, '0');

    const dataBaru = {
        id: Date.now(),
        tanggal: sekarang.toISOString().slice(0, 10),
        waktu: jamMenit,
        jenis: nominal > 0 ? 'Masuk' : 'Keluar',
        nominal: Math.abs(nominal), // Di tabel tetap angka positif agar rapi
        keterangan: ketInput,
        kasir: petugasAktif
    };

    // Update Saldo (Sekarang sudah benar karena nominal sudah dipaksa minus jika Keluar)
    saldo = Number(saldo) + nominal;

    logKasMutasi.push(dataBaru);

    // Simpan Permanen
    localStorage.setItem('warungan_mutasi_kas', JSON.stringify(logKasMutasi));
    localStorage.setItem('saldo', saldo.toString());

    // Update Tampilan
    updateSaldoDisplay();
    renderLogMutasi();

    alert(`Berhasil! ${dataBaru.jenis} Rp ${dataBaru.nominal.toLocaleString()} dicatat.`);

    // Reset & Balik Dashboard
    document.getElementById('pem-nominal').value = '';
    document.getElementById('pem-ket').value = '';
    showPage('page-saldo');
}

// --- Produk Page ---
let editProdukIdx = null;
function tambahProduk() {
    const nama = document.getElementById('prod-nama').value;
    const hargaJual = parseInt(document.getElementById('prod-harga-jual').value);
    const hargaBeli = parseInt(document.getElementById('prod-harga-beli').value);
    const stok = parseInt(document.getElementById('prod-stok').value);
    const ekstra = document.getElementById('prod-ekstra').value;
    const kategori = document.getElementById('prod-kategori').value;
    const ket = document.getElementById('prod-ket').value;
    const imgInput = document.getElementById('prod-img');
    let imgUrl = '';
    function clearForm() {
        document.getElementById('prod-nama').value = '';
        document.getElementById('prod-harga-jual').value = '';
        document.getElementById('prod-harga-beli').value = '';
        document.getElementById('prod-stok').value = '';
        document.getElementById('prod-ekstra').value = '';
        document.getElementById('prod-kategori').value = '';
        document.getElementById('prod-ket').value = '';
        document.getElementById('prod-img').value = '';
        editProdukIdx = null;
        document.getElementById('produk-submit-btn').textContent = 'Tambah Produk';
        document.getElementById('produk-cancel-btn').style.display = 'none';

    }

    function doSave(imgUrlFinal) {
        const data = { nama, hargaJual, hargaBeli, stok, ekstra, kategori, ket, imgUrl: imgUrlFinal };
        if (editProdukIdx !== null) {
            produkList[editProdukIdx] = { ...produkList[editProdukIdx], ...data };
        } else {
            produkList.push(data);
        }
        renderProduk();
        clearForm();
    }
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) { doSave(e.target.result); };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        doSave(editProdukIdx !== null ? produkList[editProdukIdx].imgUrl : '');
    }
}
function editProduk(idx) {
    const p = produkList[idx];
    document.getElementById('prod-nama').value = p.nama;
    document.getElementById('prod-harga-jual').value = p.hargaJual;
    document.getElementById('prod-harga-beli').value = p.hargaBeli;
    document.getElementById('prod-stok').value = p.stok;
    document.getElementById('prod-ekstra').value = p.ekstra;
    document.getElementById('modal-prod-kategori').value = p.kategori || '';
    document.getElementById('prod-ket').value = p.ket;
    // img not set for security reasons
    editProdukIdx = idx;
    document.getElementById('produk-submit-btn').textContent = 'Simpan Perubahan';
    document.getElementById('produk-cancel-btn').style.display = '';
}
function batalEditProduk() {
    // Clear form and reset edit mode
    document.getElementById('prod-nama').value = '';
    document.getElementById('prod-harga-jual').value = '';
    document.getElementById('prod-harga-beli').value = '';
    document.getElementById('prod-stok').value = '';
    document.getElementById('prod-ekstra').value = '';
    document.getElementById('prod-kategori').value = '';
    document.getElementById('prod-ket').value = '';
    document.getElementById('prod-img').value = '';
    editProdukIdx = null;
    document.getElementById('produk-submit-btn').textContent = 'Tambah Produk';
    document.getElementById('produk-cancel-btn').style.display = 'none';
}
function hapusProduk(idx) {
    if (!confirm('Hapus produk ini?')) return;
    produkList.splice(idx, 1);
    renderProduk();
    autoSave && autoSave();
}


// --- Produk Modal Logic ---
let editProdukIdxModal = null;

function openProdukModal(idx) {
    // Tampilkan modal dengan flex agar berada di tengah layar yang ter-blur
    const modal = document.getElementById('produk-modal');
    if (modal) modal.style.display = 'flex';

    if (typeof idx === 'number') {
        // Mode Edit
        editProdukIdxModal = idx;
        document.getElementById('produk-modal-title').textContent = 'Edit Produk';
        const p = produkList[idx];

        // Isi data ke dalam field modal
        document.getElementById('modal-prod-nama').value = p.nama || '';
        document.getElementById('modal-prod-harga-jual').value = p.hargaJual || 0;
        document.getElementById('modal-prod-harga-beli').value = p.hargaBeli || 0;
        document.getElementById('modal-prod-stok').value = p.stok || 0;
        document.getElementById('modal-prod-ekstra').value = p.ekstra || '';
        document.getElementById('modal-prod-kategori').value = p.kategori || '';
        document.getElementById('modal-prod-ket').value = p.ket || '';
        document.getElementById('modal-prod-img').value = ''; // Selalu reset input file
    } else {
        // Mode Tambah Baru
        editProdukIdxModal = null;
        document.getElementById('produk-modal-title').textContent = 'Tambah Produk';

        // Kosongkan semua field
        document.getElementById('modal-prod-nama').value = '';
        document.getElementById('modal-prod-harga-jual').value = '';
        document.getElementById('modal-prod-harga-beli').value = '';
        document.getElementById('modal-prod-stok').value = '';
        document.getElementById('modal-prod-ekstra').value = '';
        document.getElementById('modal-prod-kategori').value = '';
        document.getElementById('modal-prod-ket').value = '';
        document.getElementById('modal-prod-img').value = '';
    }
}

function closeProdukModal() {
    const modal = document.getElementById('produk-modal');
    if (modal) modal.style.display = 'none';
}

function modalSimpanProduk() {
    const nama = document.getElementById('modal-prod-nama').value;
    const hargaJual = parseInt(document.getElementById('modal-prod-harga-jual').value) || 0;
    const hargaBeli = parseInt(document.getElementById('modal-prod-harga-beli').value) || 0;
    const stok = parseInt(document.getElementById('modal-prod-stok').value) || 0;
    const ekstra = document.getElementById('modal-prod-ekstra').value;
    const kategori = document.getElementById('modal-prod-kategori').value;
    const ket = document.getElementById('modal-prod-ket').value;
    const imgInput = document.getElementById('modal-prod-img');

    function doSave(imgUrlFinal) {
        const data = {
            nama,
            hargaJual,
            hargaBeli,
            stok,
            ekstra,
            kategori,
            ket,
            imgUrl: imgUrlFinal
        };

        if (editProdukIdxModal !== null) {
            // Update produk yang sudah ada
            produkList[editProdukIdxModal] = { ...produkList[editProdukIdxModal], ...data };
        } else {
            // Tambah produk baru ke list
            produkList.push(data);
        }

        renderProduk();      // Update tampilan kartu di halaman produk
        closeProdukModal();  // Tutup modal dan hilangkan blur

        // AutoSave jika fungsi tersedia
        if (typeof autoSave === 'function') autoSave();
    }

    // Cek apakah user mengunggah gambar baru
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            doSave(e.target.result);
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        // Jika edit, gunakan gambar lama. Jika baru, biarkan kosong.
        const existingImg = (editProdukIdxModal !== null) ? produkList[editProdukIdxModal].imgUrl : '';
        doSave(existingImg);
    }
}

// Pasangkan fungsi ke window agar bisa dipanggil dari HTML
window.openProdukModal = openProdukModal;
window.closeProdukModal = closeProdukModal;
window.modalSimpanProduk = modalSimpanProduk;

// Fungsi Pencarian yang diperbarui
function produkSearchByName() {
    const val = document.getElementById('produk-search').value.trim().toLowerCase();
    kasirSearch = val; // Sync dengan variabel global pencarian
    renderProduk();
}

function renderProduk() {
    const list = document.getElementById('master-produk-list');
    if (!list) return;

    // Gunakan filter yang konsisten dengan search bar Anda
    const catFilter = document.getElementById('produk-category-filter')?.value || '';

    let filtered = produkList.filter(p => {
        let matchSearch = p.nama.toLowerCase().includes(kasirSearch.toLowerCase());
        let matchCategory = true;
        if (catFilter === 'stok habis') {
            matchCategory = (p.stok || 0) <= 0;
        } else if (catFilter) {
            matchCategory = (p.kategori || '').toLowerCase() === catFilter.toLowerCase();
        }
        return matchSearch && matchCategory;
    });

    const NO_IMG = 'https://placehold.co/200x200?text=No+Image';

    list.innerHTML = filtered.map((p) => {
        const indexAsli = produkList.findIndex(item => item === p);
        const s = p.stok || 0;
        const imgSrc = p.imgUrl ? p.imgUrl : NO_IMG;
        let warna = s <= 0 ? "#e74c3c" : (s < 5 ? "#e67e22" : "#3498db");

        return `
        <div class="card" style="
            border-left: 6px solid ${warna}; 
            display: flex; 
            flex-direction: column; 
            height: 350px; 
            width: 175px; 
            padding: 12px; 
            margin: 8px; 
            background: white;
            justify-content: space-between;
            overflow: visible;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            border-radius: 12px;
        ">
            <div style="width: 100%; height: 110px; flex-shrink: 0; overflow: hidden; border-radius: 8px; background: #f9f9f9; position: relative;">
                <img src='${imgSrc}' style='width: 100%; height: 100%; object-fit: cover;'>
                <span style="position: absolute; top: 5px; right: 5px; background:${warna}; color:white; font-size:9px; padding:2px 6px; border-radius:4px; font-weight:bold;">
                    ${s <= 0 ? 'Habis' : 'Tersedia'}
                </span>
            </div>

            <div style="position: relative; width: 100%;">
    <input type="text" id="produk-search" placeholder="Cari produk..." 
        oninput="this.nextElementSibling.style.display = this.value ? 'block' : 'none'; renderProduk()"
        style="width: 100%; padding: 10px; padding-right: 35px;">
    <span class="clear-btn" onclick="clearSearchInput('produk-search', 'renderProduk')" 
        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; display: none; color: #aaa;">&times;</span>
    <div style="position: relative; width: 100%;">
    <input type="text" id="produk-search" placeholder="Cari produk..." 
        oninput="this.nextElementSibling.style.display = this.value ? 'block' : 'none'; renderProduk()"
        style="width: 100%; padding: 10px; padding-right: 35px;">
    <span class="clear-btn" onclick="clearSearchInput('produk-search', 'renderProduk')" 
        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; display: none; color: #aaa;">&times;</span>
        </div>

            <div style="flex-grow: 1; display: flex; flex-direction: column; margin-top: 10px; overflow: hidden;">
                <b style="font-size: 0.95em; line-height: 1.2; max-height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 4px;">
                    ${p.nama}
                </b>
                <small style="color: #888; font-size: 0.8em;">Kategori: ${p.kategori || '-'}</small>
                
                <div style="margin-top: auto; padding-bottom: 5px;">
                    <span style="font-size: 0.85em;">Stok: </span>
                    <b style="color:${warna}; font-size: 1.1em;">${s}</b>
                    ${s <= 0 ? `<div style="color:#e74c3c; font-size:10px; font-weight:bold; margin-top:2px;">STOK HABIS!</div>` : ''}
                </div>
            </div>

            <div style="display: flex; gap: 5px; flex-shrink: 0;">
                <button class='kasir-btn' style="flex:1; font-size: 0.8em; padding: 7px 0;" onclick='openProdukModal(${indexAsli})'>Edit</button> 
                <button class='kasir-btn hapus' style="flex:1; font-size: 0.8em; padding: 7px 0;" onclick='hapusProduk(${indexAsli})'>Hapus</button>
            </div>
        </div>`;
    }).join('');

    if (typeof renderKasirProduk === 'function') renderKasirProduk();
}


// --- Kasir Page ---
let kasirSearch = '';

function setKasirSearch(val) {
    kasirSearch = val.toLowerCase();
    renderKasirProduk();
}

function renderKasirProduk() {
    const grid = document.getElementById('kasir-items-grid');
    if (!grid) return;

    // Placeholder yang sama dengan halaman produk
    const NO_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACt96clAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAyKADAAQAAAABAAAAyAAAAADjxo62AAAAX0lEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADuBjyWAAE9769XAAAAAElFTkSuQmCC";
    let filtered = produkList;
    if (typeof kasirSearch !== 'undefined' && kasirSearch) {
        filtered = produkList.filter(p =>
            (p.nama || "").toLowerCase().includes(kasirSearch.toLowerCase())
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #5c646e;"><i>Produk tidak ditemukan.</i></div>';
        return;
    }

    grid.innerHTML = filtered.map((p) => {
        const isHabis = (p.stok || 0) <= 0;
        const imgSrc = p.imgUrl || NO_IMG;

        return `
        <div class="card kasir-produk-card" 
             data-nama="${p.nama.replace(/"/g, '&quot;')}" 
             style="
                cursor: ${isHabis ? 'not-allowed' : 'pointer'}; 
                position: relative; 
                opacity: ${isHabis ? '0.8' : '1'};
                filter: ${isHabis ? 'grayscale(90%)' : 'none'};
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #eee;
             ">
            
            <div style="width: 100%; height: 90px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${imgSrc}" alt="${p.nama}" style="width: 100%; height: 100%; object-fit: cover;">
                
                ${isHabis ? `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                    <span style=" color: #e64545ee; font-size: 50px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">HABIS</span>
                </div>
                ` : ''}
            </div>

            <div style="padding: 8px;">
                <b style="font-size: 16px; display: block; margin-bottom: 4px; color: #1e293b;">${p.nama}</b>
                <span style="font-size: 15px; font-weight: bold; color: #2ecc71;">
                    Rp ${p.hargaJual?.toLocaleString('id-ID') || '-'}
                </span>
                <small style="display: block; font-size: 14px; font-weight: bold; color: #64748b; margin-top: 2px;">
                    Stok: ${p.stok || 0}
                </small>
            </div>
        </div>`;
    }).join('');

    // Event delegation
    grid.onclick = function (e) {
        let card = e.target.closest('.kasir-produk-card');
        if (card && card.hasAttribute('data-nama')) {
            const nama = card.getAttribute('data-nama');
            const targetProd = produkList.find(p => p.nama === nama);

            // Proteksi: Tidak bisa tambah jika stok habis
            if (targetProd && (targetProd.stok || 0) <= 0) {
                alert("Maaf, stok produk ini sudah habis!");
                return;
            }

            addToCartByName(nama);
        }
    };
}

// FIX: Finding by Name is safer than Index when filtering/searching
function addToCartByName(nama) {
    const prod = produkList.find(p => p.nama === nama);
    if (!prod) return;

    // 1. Cek apakah stok dasar memang sudah habis
    if (prod.stok <= 0) {
        alert(`Stok ${prod.nama} habis!`);
        return;
    }

    // Cari tahu apakah barang sudah ada di keranjang
    const cartIdx = cart.findIndex(item => item.nama === prod.nama);

    if (cartIdx !== -1) {
        // 2. Cek apakah penambahan qty akan melebihi stok yang ada
        if (cart[cartIdx].qty + 1 > prod.stok) {
            alert(`Stok tidak mencukupi! Maksimal stok: ${prod.stok}`);
            return;
        }
        cart[cartIdx].qty += 1;
    } else {
        // Jika baru pertama kali masuk keranjang, qty pasti 1
        // (Sudah lolos pengecekan prod.stok <= 0 di atas)
        cart.push({
            nama: prod.nama,
            hargaJual: prod.hargaJual ?? prod.harga,
            qty: 1
        });
    }

    renderCart();
}
function renderCart() {
    const list = document.getElementById('cart-list');
    if (!list) return;
    if (cart.length === 0) {
        list.innerHTML = '<i>Keranjang kosong.</i>';
    } else {
        list.innerHTML = cart.map((p, i) => `<div>${p.nama} - Rp ${(p.hargaJual || 0).toLocaleString('id-ID')} x ${p.qty} <button class='kasir-btn' onclick='decrementCart(${i})'>-</button> <button class='kasir-btn' onclick='incrementCart(${i})'>+</button> <button class='kasir-btn hapus' onclick='removeCart(${i})'>Hapus</button></div>`).join('');
    }
    const totalDisplay = document.getElementById('cart-total');
    if (totalDisplay) {
        totalDisplay.textContent = 'Rp ' + cart.reduce((sum, p) => (p.hargaJual || 0) * p.qty + sum, 0).toLocaleString('id-ID');
    }
}

function incrementCart(idx) {
    cart[idx].qty += 1;
    renderCart();
}

function decrementCart(idx) {
    if (cart[idx].qty > 1) {
        cart[idx].qty -= 1;
    } else {
        cart.splice(idx, 1);
    }
    renderCart();
}

function removeCart(idx) {
    cart.splice(idx, 1);
    renderCart();
}

function checkout() {
    if (cart.length === 0) return alert('Keranjang kosong!');

    // AMBIL NAMA KASIR AKTIF
    const petugasAktif = localStorage.getItem('activeUser') || "Kasir";

    // 1. Kurangi Stok
    cart.forEach(item => {
        const p = produkList.find(pl => pl.nama === item.nama);
        if (p) p.stok = (parseInt(p.stok) || 0) - item.qty;
    });

    const totalJual = cart.reduce((sum, p) => (p.hargaJual || 0) * p.qty + sum, 0);
    const totalModal = cart.reduce((sum, p) => (p.hargaModal || 0) * p.qty + sum, 0);

    saldo += totalJual;

    // 2. Tambah Log (Sekarang sudah ada kolom Kasir)
    transaksiLog.push({
        tanggal: new Date().toISOString().slice(0, 10),
        nominal: totalJual,
        modalTotal: totalModal,
        jenis: 'Masuk',
        ket: 'Penjualan',
        kasir: petugasAktif, // <-- FIX: Nama kasir masuk ke sini
        pembeli: document.getElementById('kasir-nama')?.value || '',
        detail: cart.map(p => ({ ...p }))
    });

    // 3. Reset Data & Input
    cart = [];
    renderCart();

    // Mengosongkan Nama Pembeli
    const nameInput = document.getElementById('kasir-nama');
    if (nameInput) nameInput.value = '';

    // Mengosongkan Search Bar & Fokus Kembali
    const searchInput = document.getElementById('kasir-search') || document.getElementById('produk-search');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus(); // Kursor otomatis balik ke sini
    }

    alert('Transaksi berhasil dicatat oleh: ' + petugasAktif);
    // 4. PANGGIL PENYIMPANAN & RENDER
    if (typeof updateSaldoDisplay === 'function') updateSaldoDisplay();
    if (typeof autoSave === 'function') autoSave();
    if (typeof renderProduk === 'function') renderProduk();
    if (typeof renderLaporan === 'function') renderLaporan();
}


// --- Laporan Page ---
function getLastMonthProfitLoss() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = (lastMonth.getMonth() + 1).toString().padStart(2, '0');
    // Filter transactions for last month
    const filtered = transaksiLog.filter(t => t.tanggal && t.tanggal.startsWith(`${year}-${month}`));
    let pemasukan = 0, pengeluaran = 0;
    filtered.forEach(t => {
        if (t.jenis === 'Masuk') pemasukan += t.nominal;
        if (t.jenis === 'Keluar') pengeluaran += t.nominal;
    });
    return { pemasukan, pengeluaran, profit: pemasukan - pengeluaran };
}
function getMonthlyRevenue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return transaksiLog.filter(t => t.tanggal && t.tanggal.startsWith(`${year}-${month}`) && t.jenis === 'Masuk')
        .reduce((sum, t) => sum + t.nominal, 0);
}
function getDailyRevenue() {
    const today = new Date().toISOString().slice(0, 10);
    return transaksiLog.filter(t => t.tanggal === today && t.jenis === 'Masuk')
        .reduce((sum, t) => sum + t.nominal, 0);
}

// --- Laporan Page: Date Filter ---
let laporanStartDate = '';
let laporanEndDate = '';
function setLaporanDateFilter() {
    laporanStartDate = document.getElementById('laporan-start').value;
    laporanEndDate = document.getElementById('laporan-end').value;
    renderLaporan();
}

function renderLaporan() {
    const list = document.getElementById('riwayat-list');
    if (!list) return;

    if (transaksiLog.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:50px; color:#aaa;"><i>Belum ada transaksi.</i></div>';
        return;
    }

    let filtered = transaksiLog.filter(t => t.jenis !== 'Piutang');

    if (laporanStartDate) filtered = filtered.filter(t => t.tanggal >= laporanStartDate);
    if (laporanEndDate) filtered = filtered.filter(t => t.tanggal <= laporanEndDate);

    // --- LOGIKA PERHITUNGAN ---
    let totalOmzet = 0;
    let totalModal = 0;

    filtered.forEach(t => {
        const nominal = t.nominal || 0;
        // Omzet hanya dihitung dari Penjualan, Masuk, atau Pelunasan (bukan hutang)
        if (t.jenis === 'Masuk' || t.jenis === 'Penjualan') {
            totalOmzet += nominal;
            totalModal += (t.modalTotal || 0);
        }
    });

    let labaBersih = totalOmzet - totalModal;

    // RENDER HTML (Analisis Pundi Dihapus)
    list.innerHTML = `
        <h3 style="text-align:center; margin-bottom:20px; color:#333;">Daftar Transaksi</h3>

<div style="position: relative; margin-bottom: 15px;">
    <input type="text" id="pencarian-nama-laporan" 
        placeholder="Ketik nama pembeli..." 
        onkeyup="filterTabelLaporan()" 
        style="width: 100%; padding: 10px 35px 10px 10px; border: 1px solid #ddd; border-radius: 5px;">
    
    <span onclick="hapusSearchLaporan()" 
        style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #ccc; font-size: 18px;">
        &times;
    </span>
</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: #2ecc71; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <small style="font-weight: bold; opacity: 0.9;">TOTAL OMZET</small>
                <h2 style="margin: 5px 0;">Rp ${totalOmzet.toLocaleString('id-ID')}</h2>
            </div>
            <div style="background: #3498db; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <small style="font-weight: bold; opacity: 0.9;">LABA BERSIH</small>
                <h2 style="margin: 5px 0;">Rp ${labaBersih.toLocaleString('id-ID')}</h2>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
            <div style='background: white; padding: 10px; border-radius: 8px; border: 1px solid #ddd;'>
                <label>Dari: <input type='date' id='laporan-start' value='${laporanStartDate}' onchange='setLaporanDateFilter()'></label>
                <label style='margin-left:10px'>Sampai: <input type='date' id='laporan-end' value='${laporanEndDate}' onchange='setLaporanDateFilter()'></label>
            </div>
            <button class="btn-primary" style="width: auto; margin: 0; background: #27ae60;" onclick="exportLaporanExcel()">
                <i class="fas fa-file-excel"></i> Ekspor ke Excel
            </button>
        </div>
        
        <div style="overflow-x: auto; background: white; border-radius: 10px; border: 1px solid #ddd;">
            <table style='width:100%; border-collapse: collapse; font-size:0.95em;'>
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Tanggal</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Kasir</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Jenis</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: right;">Nominal</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Detail Barang / Ket</th>
                        <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Pembeli</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map((t) => {
        let displayKet = t.ket || '';

        // Menampilkan detail barang jika ada, menggantikan teks 'Penjualan'
        if ((displayKet === 'Penjualan' || displayKet === '') && t.detail && t.detail.length > 0) {
            displayKet = t.detail.map(d => `${d.nama} (${d.qty})`).join(', ');
        }

        return `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 12px;">${t.tanggal}</td>
                            <td style="padding: 12px;">${t.kasir || '-'}</td>
                            <td style="padding: 12px;"><span style="color:${t.jenis === 'Masuk' || t.jenis === 'Penjualan' ? '#2ecc71' : '#e67e22'}; font-weight:bold;">${t.jenis}</span></td>
                            <td style="padding: 12px; font-weight:bold; text-align: right;">Rp ${t.nominal.toLocaleString('id-ID')}</td>
                            <td style="padding: 12px; color: #555;">${displayKet}</td>
                            <td style="padding: 12px;">${t.pembeli || ''}</td>
                        </tr>`;
    }).reverse().join('')}
                </tbody>
            </table>
        </div>
    `;

    if (typeof renderOmzetChart === 'function') renderOmzetChart();
}

function filterTabelLaporan() {
    const input = document.getElementById('pencarian-nama-laporan');
    const filter = input.value.toLowerCase();
    const tabel = document.querySelector("#riwayat-list table");
    const tr = tabel.getElementsByTagName("tr");

    // Loop semua baris tabel (kecuali header)
    for (let i = 1; i < tr.length; i++) {
        // Kolom Nama Pembeli ada di urutan ke-6 (index 5)
        const td = tr[i].getElementsByTagName("td")[5];
        if (td) {
            const teksNama = td.textContent || td.innerText;
            if (teksNama.toLowerCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// Fungsi tombol X untuk hapus pencarian
function hapusSearchLaporan() {
    const input = document.getElementById('pencarian-nama-laporan');
    input.value = "";
    filterTabelLaporan(); // Tampilkan semua lagi
}

// --- Piutang Data ---
let piutangList = [];

function getFormattedTime() {
    const sekarang = new Date();
    let hours = sekarang.getHours();
    // Perbaikan: gunakan getMinutes() bukan getHours() untuk menit
    const minutes = sekarang.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Jam '0' dikonversi ke '12'

    return `${hours}:${minutes} ${ampm}`;
}

function tambahPiutang() {
    if (cart.length === 0) return alert('Keranjang kosong!');
    const nama = document.getElementById('kasir-nama')?.value;
    if (!nama) return alert('Nama pembeli wajib diisi!');

    window.tempPiutangNama = nama;

    // Menampilkan modal dengan ID yang konsisten
    const modal = document.getElementById('modal-due-date');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Fallback jika HTML belum terpasang
        const tgl = prompt("Bayar kapan? (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
        if (tgl) processPiutangSaving(tgl);
    }
}

function confirmPiutang() {
    if (cart.length === 0) return;

    const pembeli = document.getElementById('kasir-nama').value || 'Umum';
    const tglTempo = document.getElementById('input-jatuh-tempo').value;
    const petugasAktif = localStorage.getItem('activeUser') || "Kasir";

    // FIX: Kurangi stok produk sebelum dipindah ke piutang
    cart.forEach(item => {
        const p = produkList.find(pl => pl.nama === item.nama);
        if (p) {
            p.stok = (parseInt(p.stok) || 0) - item.qty;
        }
    });

    // Masukkan ke daftar piutang
    piutangList.push({
        id: Date.now(), // Tambahkan baris ini agar setiap kartu punya KTP sendiri
        pembeli: pembeli,
        item: [...cart],
        total: cart.reduce((sum, i) => sum + (i.hargaJual * i.qty), 0),
        tanggal: new Date().toLocaleDateString('id-ID'),
        tempo: tglTempo,
        kasir: petugasAktif,
        status: 'Hutang'
    });

    // RESET & BALIK KE HOME
    cart = [];
    renderCart();
    autoSave();
    renderProduk(); // Update tampilan agar muncul tulisan "HABIS"

    alert("Piutang berhasil dicatat!");
    showPage('page-saldo'); // Balik ke Dashboard
}

function closeDueDateModal() {
    const modal = document.getElementById('modal-due-date');
    if (modal) modal.style.display = 'none';
}

function nantiPiutang() {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    processPiutangSaving(tomorrow.toISOString().slice(0, 10));
}

// Logika inti penyimpanan piutang
function processPiutangSaving(selectedDueDate) {
    const namaInput = document.getElementById('kasir-nama');
    const nama = namaInput ? namaInput.value : '';

    // 1. HITUNG TOTAL & SCAN USER (Agar Laporan Tidak '-')
    const totalJual = cart.reduce((sum, p) => (p.hargaJual || 0) * p.qty + sum, 0);
    const totalModal = cart.reduce((sum, p) => (p.hargaModal || 0) * p.qty + sum, 0);
    const currentUser = localStorage.getItem("activeUser") || "Kasir";
    const sekarang = new Date();

    // 2. POTONG STOK (Logika Persis Checkout - Memperbaiki Bug Stok)
    cart.forEach(item => {
        const p = produkList.find(pl => pl.nama === item.nama);
        if (p) {
            // Ini yang membuat stok 1 menjadi 0 (HABIS)
            p.stok = (parseInt(p.stok) || 0) - item.qty;
        }
    });

    const dataPiutangBaru = {
        tanggalBuat: sekarang.toISOString().slice(0, 10),
        tanggal: selectedDueDate,
        waktu: typeof getFormattedTime === 'function' ? getFormattedTime() : "",
        nama: nama || '(Tanpa Nama)',
        nominal: totalJual,
        detail: cart.map(p => ({ ...p })),
        lunas: false,
        inputOleh: currentUser, // Muncul di kartu piutang
        tglInput: sekarang.toLocaleDateString('id-ID')
    };

    // 3. SIMPAN KE DAFTAR PIUTANG
    piutangList.push(dataPiutangBaru);

    // 4. KIRIM KE LAPORAN (Memperbaiki Bug Laporan '-')
    transaksiLog.push({
        tanggal: dataPiutangBaru.tanggalBuat,
        kasir: currentUser,     // Menulis nama kasir pilihan
        jenis: 'Piutang',
        nominal: totalJual,
        modalTotal: totalModal,
        ket: 'Hutang: ' + dataPiutangBaru.nama,
        pembeli: dataPiutangBaru.nama,
        detail: dataPiutangBaru.detail
    });

    // 5. RESET KERANJANG & FORM
    cart = [];
    if (typeof renderCart === 'function') renderCart();
    if (document.getElementById('produk-search')) document.getElementById('produk-search').value = '';
    if (namaInput) namaInput.value = '';

    closeDueDateModal();
    renderPiutang();

    // 6. SIMPAN PERMANEN & UPDATE TAMPILAN
    if (typeof autoSave === 'function') autoSave();
    if (typeof renderProduk === 'function') renderProduk(); // Memaksa label 'HABIS' muncul
    if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
    if (typeof refreshSemuaNotifikasi === 'function') refreshSemuaNotifikasi();
    if (typeof renderLaporan === 'function') renderLaporan(); // Update tabel laporan

    alert(`Piutang berhasil dicatat oleh: ${currentUser}`);

    // Kembali ke dashboard agar saldo terupdate
    showPage('page-saldo');
}

function closeDueDateModal() {
    const modal = document.getElementById('modal-due-date');
    if (modal) modal.style.display = 'none';
}

function lunasPiutang(idx) {
    if (!confirm('Tandai sebagai lunas?')) return;

    // 1. Ambil data
    const data = piutangList[idx];
    if (data.lunas) return alert('Sudah lunas!');

    // --- SCAN USER AKTIF (Agar Laporan Tidak '-') ---
    const petugasAktif = localStorage.getItem('activeUser') || "Kasir";

    // 2. Update data di memori
    const nominalHutang = parseFloat(data.nominal) || 0;
    saldo += nominalHutang;

    data.lunas = true;
    data.tanggalLunas = new Date().toISOString().slice(0, 10);
    data.dilunaskanOleh = petugasAktif; // Mencatat siapa yang terima uang lunas

    // 3. Tambahkan ke Log Transaksi (Fix Laporan Kasir)
    transaksiLog.push({
        tanggal: new Date().toISOString().slice(0, 10),
        nominal: nominalHutang,
        jenis: 'Masuk',
        ket: `Pelunasan: ${data.nama}`,
        kasir: petugasAktif, // KUNCI INI yang bikin laporan tidak '-'
        pembeli: data.nama
    });

    // 4. LANGSUNG SIMPAN
    localStorage.setItem('saldo', saldo.toString());
    localStorage.setItem('piutangList', JSON.stringify(piutangList));
    localStorage.setItem('transaksiLog', JSON.stringify(transaksiLog));

    // 5. UPDATE TAMPILAN
    if (typeof updateSaldoDisplay === 'function') updateSaldoDisplay();

    try {
        if (typeof renderPiutang === 'function') renderPiutang();
        if (typeof renderLaporan === 'function') renderLaporan();
    } catch (err) {
        console.log("Ada fungsi display yang error, tapi data sudah aman tersimpan.");
    }

    if (typeof updatePiutangBadge === 'function') updatePiutangBadge();

    alert(`Pelunasan Berhasil! Dicatat oleh: ${petugasAktif}`);
}

//newsimpannamauserpiutang
function selectUser(nama) {
    // Simpan ke variabel global supaya bisa dibaca fungsi lain
    window.currentUser = nama;

    // Simpan ke localStorage agar kalau refresh halaman tidak hilang
    localStorage.setItem("activeUser", nama);

    // Tutup modal
    document.getElementById('user-modal').style.display = 'none';

    console.log("Kasir aktif:", nama);
}

function getTotalPiutang() {
    return piutangList.filter(p => !p.lunas).reduce((sum, p) => sum + p.nominal, 0);
}

// --- User Selection Modal: always show on refresh, no localStorage ---
let currentUser = null;
function showUserModal() {
    document.getElementById('user-modal').style.display = 'flex';
}
function selectUser(name) {
    currentUser = name;
    document.getElementById('user-modal').style.display = 'none';
    showWelcomeUser();
}
function showWelcomeUser() {
    const el = document.getElementById('welcome-user');
    if (el && currentUser) {
        el.textContent = 'Selamat datang kembali ' + capitalize(currentUser);
        el.style.display = 'margin-bottom:20px;';
    }
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
window.addEventListener('DOMContentLoaded', function () {
    showUserModal();
});

// Ganti User button
window.showUserModal = showUserModal;

// --- Piutang Search Filter ---
let piutangFilterNama = '';
let piutangFilterTanggal = '';
function filterPiutang() {
    piutangFilterNama = document.getElementById('piutang-search-nama').value.trim().toLowerCase();
    piutangFilterTanggal = document.getElementById('piutang-search-tanggal').value;
    renderPiutang();
}
function resetPiutangFilter() {
    piutangFilterNama = '';
    piutangFilterTanggal = '';
    document.getElementById('piutang-search-nama').value = '';
    document.getElementById('piutang-search-tanggal').value = '';
    renderPiutang();
}

function renderProduk() {
    const list = document.getElementById('master-produk-list');
    const cat = document.getElementById('produk-category-filter')?.value || '';
    if (!list) return;

    // GABUNGKAN FILTER: Kategori + Pencarian Nama
    let filtered = produkList.filter(p => {
        // 1. Logika Filter Kategori / Stok Habis
        let matchCategory = true;
        if (cat === 'stok habis') {
            matchCategory = p.stok <= 0;
        } else if (cat) {
            matchCategory = (p.kategori || '').toLowerCase() === cat.toLowerCase();
        }

        // 2. Logika Pencarian Nama (kasirSearch)
        let matchSearch = p.nama.toLowerCase().includes(kasirSearch) ||
            (p.kategori && p.kategori.toLowerCase().includes(kasirSearch));

        return matchCategory && matchSearch; // Harus memenuhi keduanya
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div style="padding:20px; color:#888;">Produk tidak ditemukan.</div>';
        return;
    }

    list.innerHTML = filtered.map((p) => {
        // Gunakan findIndex agar index Edit/Hapus selalu merujuk ke produkList asli
        const indexAsli = produkList.findIndex(item => item === p);

        return `
        <div class="card">
            ${p.imgUrl ? `<img src='${p.imgUrl}' alt='${p.nama}' style='width:100%;max-height:100px;object-fit:contain;margin-bottom:8px;'>` : ''}
            <b>${p.nama}</b><br>
            <small>Kategori: ${p.kategori || '-'}</small><br>
            <span>Jual: Rp ${p.hargaJual?.toLocaleString('id-ID') || '-'}<br>Beli: Rp ${p.hargaBeli?.toLocaleString('id-ID') || '-'}</span><br>
            <span>Stok: ${p.stok || 0}</span><br>
            ${p.ekstra ? `<span>Ekstra: ${p.ekstra}</span><br>` : ''}
            ${p.ket ? `<span style='font-size:0.9em;color:#888'>${p.ket}</span><br>` : ''}
            <button class='kasir-btn' onclick='openProdukModal(${indexAsli})'>Edit</button> 
            <button class='kasir-btn hapus' onclick='hapusProduk(${indexAsli})'>Hapus</button>
        </div>`;
    }).join('');
}

// --- Persistence (localStorage) ---
function saveAllData() {
    // 1. Save to phone memory
    localStorage.setItem('warungan_produk', JSON.stringify(produkList));
    localStorage.setItem('warungan_transaksi', JSON.stringify(transaksiLog));
    localStorage.setItem('warungan_piutang', JSON.stringify(piutangList));
    localStorage.setItem('warungan_mutasi_kas', JSON.stringify(logKasMutasi));
    localStorage.setItem('warungan_saldo', saldo);

    // 2. STOP LOOP: If we are downloading from cloud, don't send it back up!
    if (window.sedangSinkron) return;

    // 3. Send to Firebase
    if (typeof window.simpanKeCloud === "function") {
        window.simpanKeCloud(produkList, transaksiLog, piutangList, logKasMutasi, saldo);
    }
}

function loadAllData() {
    try {
        produkList = JSON.parse(localStorage.getItem('warungan_produk')) || [];
        transaksiLog = JSON.parse(localStorage.getItem('warungan_transaksi')) || [];
        piutangList = JSON.parse(localStorage.getItem('warungan_piutang')) || [];
        // Muat data mutasi agar muncul setelah refresh
        logKasMutasi = JSON.parse(localStorage.getItem('warungan_mutasi_kas')) || [];

        const savedSaldo = localStorage.getItem('warungan_saldo');
        saldo = savedSaldo ? parseInt(savedSaldo) : 0;
    } catch (e) { console.error("Error loading data", e); }
}

// Save after every change
function autoSave() {
    saveAllData();
}
// Patch all mutating functions to call autoSave
['tambahProduk', 'hapusProduk', 'prosesPemasukan', 'tambahPiutang', 'hapusPiutang', 'lunasPiutang', 'checkout',].forEach(fn => {
    const orig = window[fn];
    if (typeof orig === 'function') {
        window[fn] = function (...args) {
            const res = orig.apply(this, args);
            autoSave();
            return res;
        }
    }
});
window.addEventListener('DOMContentLoaded', function () {
    loadAllData();
    showPage('page-saldo');
    updatePiutangBadge();
});

const pageHooks = {
    'page-saldo': updateSaldoDisplay,
    'page-pemasukan': undefined,
    'page-kasir': function () { renderProduk(); renderKasirProduk(); renderCart(); },
    'page-produk': renderProduk,
    'page-laporan': renderLaporan,
    'page-piutang': renderPiutang,
    'page-log-mutasi': function () { renderLogMutasi(); }, // Gunakan koma di sini
    'page-galon': renderGalon,
    'page-gas': renderGas,
    'page-koin': renderKoin
};

function showPage(pageId) {
    // 1. Sembunyikan semua halaman
    document.querySelectorAll('.app-page').forEach(page => {
        page.style.display = 'none';
    });

    // 2. Tampilkan halaman yang dipilih
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.style.display = 'block';

    // 3. LOGIKA INDIKATOR AKTIF:
    // Hapus kelas 'active' dari semua menu sidebar
    document.querySelectorAll('.sidebar ul li').forEach(li => {
        li.classList.remove('active');
    });

    // Tambahkan kelas 'active' ke menu yang diklik
    // Tips: Pastikan atribut 'onclick' di HTML memanggil dengan benar
    const activeMenu = document.querySelector(`.sidebar ul li[onclick*="${pageId}"]`);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }

    if (pageHooks[pageId]) pageHooks[pageId]();
}

function printStruk(idx) {
    const t = transaksiLog[idx];
    if (!t) return;
    let struk = `Tanggal: ${t.tanggal}\nNama Kasir: ${capitalize(t.kasir || '-')}\nNama Pembeli: ${t.pembeli || '-'}\nBarang: ${(t.detail || []).map(d => `${d.nama} x${d.qty}`).join(', ')}\nTotal: Rp ${(t.nominal || 0).toLocaleString('id-ID')}`;
    const win = window.open('', '', 'width=400,height=600');
    win.document.write(`<pre style='font-size:1.2em'>${struk.replace(/\n/g, '<br>')}</pre>`);
    win.print();
    win.close();
}

// --- Piutang Edit & Hapus --- (not useful)
/* function editPiutang(idx) {
    const p = piutangList[idx];
    if (!p || p.lunas) return alert('Tidak bisa edit piutang lunas!');
    // Only allow editing nama and nominal
    const nama = prompt('Edit Nama Pembeli:', p.nama);
    if (nama === null) return;
    let nominal = prompt('Edit Nominal:', p.nominal);
    if (nominal === null) return;
    nominal = parseInt(nominal);
    if (isNaN(nominal) || nominal <= 0) return alert('Nominal tidak valid!');
    p.nama = nama;
    p.nominal = nominal;
    renderPiutang();
    autoSave && autoSave();
}*/

function hapusPiutang(idUnik) {
    if (!confirm('Hapus piutang ini?')) return;

    // Cari posisi data yang ID-nya cocok
    const idx = piutangList.findIndex(p => p.id === idUnik);

    if (idx !== -1) {
        piutangList.splice(idx, 1); // Hapus data yang benar
        renderPiutang();            // Refresh layar
        saveAllData();              // Simpan ke HP
        updatePiutangBadge();       // Update angka notifikasi
    }
}



// --- Piutang Search: live filter ---
document.getElementById('piutang-search-nama').oninput = filterPiutang;
document.getElementById('piutang-search-tanggal').oninput = filterPiutang;

// Reset Saldo logic
function resetSaldoPrompt() {
    const val = prompt('Ketik "reset saldo" untuk mengatur saldo menjadi 0 rupiah.');
    if (val && val.trim().toLowerCase() === 'reset saldo') {
        saldo = 0;
        updateSaldoDisplay();
        autoSave && autoSave();
        alert('Saldo telah direset ke Rp 0');
    } else if (val !== null) {
        alert('Konfirmasi salah. Saldo tidak direset.');
    }
}
window.resetSaldoPrompt = resetSaldoPrompt;

// Center produk modal and set medium size
const produkModal = document.getElementById('produk-modal');
if (produkModal) {
    produkModal.style.display = 'none';
    produkModal.style.alignItems = 'center';
    produkModal.style.justifyContent = 'center';
}

// --- Laporan Filter: Periode & Tanggal ---
function applyLaporanFilter() {
    // Get selected period
    const periode = document.getElementById('laporan-periode').value;
    const start = document.getElementById('laporan-date-start').value;
    const end = document.getElementById('laporan-date-end').value;
    let today = new Date();
    let filterStart = '', filterEnd = '';
    if (periode === 'hari-ini') {
        filterStart = filterEnd = today.toISOString().slice(0, 10);
    } else if (periode === 'kemarin') {
        let kemarin = new Date(today.getTime() - 86400000);
        filterStart = filterEnd = kemarin.toISOString().slice(0, 10);
    }
    if (start) filterStart = start;
    if (end) filterEnd = end;
    laporanStartDate = filterStart;
    laporanEndDate = filterEnd;
    renderLaporan();
}
window.applyLaporanFilter = applyLaporanFilter;

//ringkasan laporan (masih belum jadi bjir)
function getringkasanLaporan() {
    const totalTransaksi = transaksiLog.length;
    const totalPemasukan = transaksiLog.filter(t => t.jenis === 'Masuk').reduce((sum, t) => sum + t.nominal, 0);
    const totalPengeluaran = transaksiLog.filter(t => t.jenis === 'Keluar').reduce((sum, t) => sum + t.nominal, 0);
    return {
        totalTransaksi,
        totalPemasukan,
        totalPengeluaran
    }
}

/*tambahan fitur*/
// Simpan riwayat halaman dalam array
window.pageHistory = ['page-saldo'];

// Fungsi Home (Universal)
function goHome() {
    showPage('page-saldo');
    playSound('click.mp3'); // Tambahkan ini
    renderDashboard();
}

// Fungsi Refresh (Universal)
function refreshPage() {
    loadAllData();
    updateSaldoDisplay();
    // Deteksi halaman mana yang sedang dibuka lalu render ulang
    const currentPage = document.querySelector('.app-page:not([style*="display: none"])');
    if (currentPage) {
        const id = currentPage.id;
        if (id === 'page-produk') renderProduk();
        if (id === 'page-piutang') renderPiutang();
        if (id === 'page-laporan') renderLaporan();
    }
    alert('Data Berhasil Direfresh');
}

// Fungsi Back (Universal)
// Inisialisasi history
window.pageHistory = ['page-saldo'];

// Fungsi Back yang diperbaiki
function goBack() {
    playSound('back.mp3');
    if (window.pageHistory.length > 1) {
        // 1. Hapus halaman saat ini dari history
        window.pageHistory.pop();

        // 2. Ambil ID halaman sebelumnya
        const prevPage = window.pageHistory[window.pageHistory.length - 1];

        // 3. Tampilkan halaman tersebut TANPA menambah history baru
        // Kita panggil fungsi internal agar tidak memicu tracker
        renderHalamanTanpaHistory(prevPage);
    }
}

// Fungsi pembantu untuk pindah halaman tanpa menambah history
function renderHalamanTanpaHistory(pageId) {
    document.querySelectorAll('.app-page').forEach(p => p.style.display = 'none');
    const target = document.getElementById(pageId);
    if (target) target.style.display = '';

    // Update Sidebar
    document.querySelectorAll('.sidebar ul li').forEach(nav => nav.classList.remove('active'));
    const navId = 'nav-' + pageId.replace('page-', '');
    const navItem = document.getElementById(navId);
    if (navItem) navItem.classList.add('active');
}

// Override showPage asli untuk mencatat history hanya saat klik navigasi baru
const originalShowPage = showPage;
showPage = function (pageId) {
    if (window.pageHistory[window.pageHistory.length - 1] !== pageId) {
        window.pageHistory.push(pageId);
    }
    originalShowPage(pageId);
};

// --- Piutang with Due Date Modal ---
let currentUtangData = null; // Temporary storage

// Function called when "Utang" button is clicked in Kasir
function prosesUtang(data) {
    currentUtangData = data;
    document.getElementById('modal-jatuh-tempo').style.display = 'flex';
}

function konfirmasiUtang(pakeTempo) {
    const tglTempo = pakeTempo ? document.getElementById('input-tgl-tempo').value : null;

    const dataBaru = {
        ...currentUtangData,
        jatuhTempo: tglTempo,
        status: 'belum lunas',
        id: Date.now()
    };

    piutangList.push(dataBaru);
    document.getElementById('modal-jatuh-tempo').style.display = 'none';
    renderPiutang(); // Refresh UI
    updateNotifBadges(); // Update red circles
}

function updatePiutangBadge() {
    // 1. Hitung jumlah piutang yang belum lunas
    const unpaidCount = piutangList.filter(p => p.lunas === false).length;

    // 2. Update Badge Sidebar (Warna Hijau di menu kiri)
    const sidebarBadge = document.querySelector('.menu-item[data-target="piutang"] .badge') ||
        document.getElementById('sidebar-piutang-badge');
    if (sidebarBadge) {
        sidebarBadge.textContent = unpaidCount;
        sidebarBadge.style.display = unpaidCount > 0 ? 'inline-block' : 'none';
    }

    // 3. Update Badge Laci/Drawer (Tombol Merah angka 3 di gambar)
    const drawerBadge = document.getElementById('badge-piutang-count');
    if (drawerBadge) {
        drawerBadge.innerText = unpaidCount;
        drawerBadge.style.display = unpaidCount > 0 ? 'inline-block' : 'none';
    }

    // Panggil updateNotif jika memang ada untuk sinkronisasi extra
    if (typeof updateNotifBadges === 'function') {
        try { updateNotifBadges(); } catch (e) { console.log("Notif function skipped"); }
    }
}

// Function for the X button click
function clearKasirSearch() {
    const searchInput = document.getElementById('kasir-search');

    // 1. Clear the text
    searchInput.value = '';

    // 2. Hide the X button
    document.getElementById('clear-search-btn').style.display = 'none';

    // 3. Reset the product grid (show all)
    setKasirSearch('');

    // 4. Put focus back on input
    searchInput.focus();
}

//piutang notif stack
// Run this when the web starts
window.addEventListener('DOMContentLoaded', () => {
    checkDuePiutang();
});

function checkDuePiutang() {
    
    const today = new Date().toISOString().slice(0, 10);
    const dueItems = piutangList.filter(p => p.lunas === false && p.tanggal <= today);

    const laci = document.getElementById('notif-laci');
    const list = document.getElementById('laci-list');
    const countLabel = document.getElementById('laci-count');

    if (dueItems.length > 0) {
        laci.style.display = 'block';
        countLabel.innerText = dueItems.length;
        list.innerHTML = '';

        dueItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'notif-card-laci';
            card.style.position = 'relative';
            card.style.paddingTop = '20px';

            card.innerHTML = `
        <button class="close-btn" 
            style="position: absolute !important; top: 8px !important; right: 8px !important; background: rgba(0,0,0,0.05); border: none; width: 24px; height: 24px; border-radius: 50%; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 99;">
            <i class="fas fa-times" style="font-size: 0.8em; pointer-events: none;"></i>
        </button>

        <div style="color: #2c3e50; margin-bottom: 5px; text-align: left;">
            <small style="font-size: 10px; font-weight: bold; color: #747d8c;">NAMA:</small><br>
            <span style="font-size: 15px; font-weight: bold;">${item.nama || '(Tanpa Nama)'}</span>
        </div>
        <div style="color: #c0392b; margin-bottom: 10px; text-align: left;">
            <small style="font-size: 10px; font-weight: bold; color: #747d8c;">TOTAL:</small><br>
            <span style="font-size: 14px; font-weight: bold;">Rp ${item.nominal.toLocaleString('id-ID')}</span>
        </div>
        <div style="display: flex; gap: 5px;">
            <button onclick="lihatDetailDariLaci('${item.nama}')" 
                style="flex: 2; background: #3498db; color: white; border: none; padding: 6px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">
                Detail
            </button>
            <button class="nanti-btn" style="flex:1; background:#e67e22; color:white; border:none; padding:6px; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 11px;">Nanti</button>
        </div>
        <div class="snooze-options" style="display:none; margin-top:10px; padding-top: 10px; border-top: 1px solid #ddd;">
            <button onclick="prosesSnooze(this, '${item.nama}', 1)" style="width:100%; margin-bottom:5px; background:#3498db; color:white; border:none; padding:6px; border-radius:4px; cursor:pointer;">Besok</button>
            <button onclick="prosesSnooze(this, '${item.nama}', 2)" style="width:100%; background:#34495e; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Lusa</button>
        </div>
    `;

            // Handler Tombol X (Close)
            card.querySelector('.close-btn').onclick = () => {
                card.remove();
                const remaining = list.querySelectorAll('.notif-card-laci').length;
                if (remaining === 0) {
                    laci.style.display = 'none';
                } else {
                    countLabel.innerText = remaining;
                }
            };

            // Handler Tombol Nanti
            card.querySelector('.nanti-btn').onclick = () => {
                const opt = card.querySelector('.snooze-options');
                opt.style.display = opt.style.display === 'none' ? 'block' : 'none';
            };

            list.appendChild(card);
        });
    } else {
        laci.style.display = 'none';
    }

}

//supaya kalau snooze akartu hilang laci juga

function createNotificationCard(item, index) {
    const stack = document.getElementById('notification-stack');
    const card = document.createElement('div');

    // Styling the "Ads-like" card
    card.className = 'notif-card';
    card.style = `
        background: white; border-left: 5px solid #e74c3c; padding: 15px; margin-top: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 8px; position: relative;
        animation: slideIn 0.5s ease;
    `;

    card.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position:absolute; right:5px; top:5px; border:none; background:none; cursor:pointer;">&times;</button>
        <strong style="color:#2c3e50;">Jatuh Tempo!</strong>
        <p style="margin:5px 0; font-size:14px;"><b>${item.nama}</b>: Rp ${item.nominal.toLocaleString('id-ID')}</p>
        <div style="display:flex; gap:5px; margin-top:10px;">
            <button onclick="markAsPaidFromNotif('${item.nama}', ${item.nominal}, this)" style="background:#2ecc71; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Sudah Bayar</button>
            <button onclick="showSnoozeOptions(this)" style="background:#e67e22; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Belum Bayar</button>
        </div>
        <div class="snooze-options" style="display:none; margin-top:10px; border-top:1px solid #eee; pt:5px;">
            <p style="font-size:11px; margin-bottom:5px;">Ingatkan lagi:</p>
            <button onclick="snoozePiutang('${this, item.nama}', 1, this)" style="font-size:10px; padding:3px 7px;">Besok</button>
            <button onclick="snoozePiutang('${this, item.nama}', 2, this)" style="font-size:10px; padding:3px 7px;">Lusa</button>
        </div>
    `;

    stack.appendChild(card);
}

// Action: Mark as Paid
function markAsPaidFromNotif(nama, nominal, btn) {
    const target = piutangList.find(p => p.nama === nama && p.nominal === nominal && p.lunas === false);
    if (target) {
        target.lunas = true;
        autoSave && autoSave();
        renderPiutang();
        updatePiutangBadge();
        btn.closest('.notif-card').remove();
        alert('Data piutang diperbarui ke Lunas!');
    }
}

// Action: Show Snooze (Belum Bayar)
function showSnoozeOptions(btn) {
    const snoozeDiv = btn.closest('.notif-card').querySelector('.snooze-options');
    snoozeDiv.style.display = 'block';
}

// Action: Reschedule (Besok/Lusa)
function snoozePiutang(nama, days, btn) {
    const target = piutangList.find(p => p.nama === nama && p.lunas === false);
    if (target) {
        let newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        target.tanggal = newDate.toISOString().slice(0, 10);
        autoSave && autoSave();
        btn.closest('.notif-card').remove();
        alert(`Akan diingatkan kembali pada ${target.tanggal}`);
    }
}

//piutang drawer//
// 1. Toggle Drawer Slide
function toggleLaci() {
    document.getElementById('notif-laci').classList.toggle('laci-closed');
}

// 2. Scan and Display Due Piutang
function checkDuePiutang() {
    const today = new Date().toISOString().slice(0, 10);
    // Ambil utang yang belum lunas dan sudah jatuh tempo (tanggal <= hari ini)
    const dueItems = piutangList.filter(p => p.lunas === false && p.tanggal <= today);

    const laci = document.getElementById('notif-laci');
    const list = document.getElementById('laci-list');
    const countLabel = document.getElementById('laci-count');

    if (dueItems.length > 0) {
        laci.style.display = 'block';
        countLabel.innerText = dueItems.length;
        list.innerHTML = '';

        dueItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'notif-card-laci';
            card.style.cssText = `
                position: relative;
                display: block;
                background: #fff;
                margin-bottom: 15px;
                padding: 15px;
                border-radius: 10px;
                border-left: 5px solid #e74c3c;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            `;

            // Bagian HTML (Tanpa onclick snooze di sini)
            card.innerHTML = `
                <button class="close-btn" style="position:absolute; top:5px; right:5px; border:none; background:#f1f2f6; width:22px; height:22px; border-radius:50%; cursor:pointer;">&times;</button>
                <div style="color: #2c3e50; margin-bottom: 5px;">
                    <small style="font-size: 10px; font-weight: bold; color: #747d8c;">NAMA:</small><br>
                    <span style="font-size: 14px; font-weight: bold;">${item.nama || '(Tanpa Nama)'}</span>
                </div>
                <div style="color: #c0392b; margin-bottom: 10px;">
                    <small style="font-size: 10px; font-weight: bold; color: #747d8c;">TOTAL:</small><br>
                    <span style="font-size: 14px; font-weight: bold;">Rp ${item.nominal.toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="detail-btn" style="flex: 2; background: #3498db; color: white; border: none; padding: 6px; border-radius: 5px; cursor: pointer; font-weight: bold;">Detail</button>
                    <button class="nanti-btn" style="flex: 1; background: #e67e22; color: white; border: none; padding: 6px; border-radius: 5px; cursor: pointer; font-weight: bold;">Nanti</button>
                </div>
                <div class="snooze-options" style="display:none; margin-top:10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <button class="snooze-1" style="width:100%; margin-bottom:5px; background:#2ecc71; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Tunda Besok</button>
                    <button class="snooze-2" style="width:100%; background:#34495e; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">Tunda Lusa</button>
                </div>
            `;

            // --- LOGIKA TOMBOL (Langsung dipasang di sini) ---

            // 1. Tombol Close
            card.querySelector('.close-btn').onclick = () => {
                card.remove(); // Removes the specific card

                // Check if the list is now empty
                const list = document.getElementById('laci-list');
                const laci = document.getElementById('notif-laci');

                if (list.children.length === 0) {
                    // If no cards are left, make the whole laci disappear
                    laci.style.display = 'none';
                }
            };

            // 2. Tombol Detail
            card.querySelector('.detail-btn').onclick = () => lihatDetailDariLaci(item.nama);

            // 3. Tombol Nanti (Munculkan pilihan tunda)
            card.querySelector('.nanti-btn').onclick = () => {
                const opt = card.querySelector('.snooze-options');
                opt.style.display = opt.style.display === 'none' ? 'block' : 'none';
            };

            // 4. Tombol Tunda 1 Hari (Besok)
            card.querySelector('.snooze-1').onclick = function () {
                prosesSnooze(item, 1);
            };

            // 5. Tombol Tunda 2 Hari (Lusa)
            card.querySelector('.snooze-2').onclick = function () {
                prosesSnooze(item, 2);
            };

            list.appendChild(card);
        });
    } else {
        laci.style.display = 'none';
    }
}

// Fungsi pembantu untuk memproses tanggal
function prosesSnooze(item, days) {
    let d = new Date();
    d.setDate(d.getDate() + days);

    // Format YYYY-MM-DD
    item.tanggal = d.toISOString().slice(0, 10);

    alert(`Berhasil! Utang ${item.nama} ditunda ke tanggal ${item.tanggal}`);

    if (typeof autoSave === 'function') autoSave();
    renderPiutang();   // Update tabel
    checkDuePiutang(); // Refresh laci (item ini akan hilang karena tgl > hari ini)
}

// Helper to open/close the drawer
function toggleLaci() {
    const laci = document.getElementById('notif-laci');
    laci.classList.toggle('laci-closed');
}

//hide laci


function bukaPiutangDariLaci(nama) {
    // 1. Arahkan ke section/halaman piutang (jika aplikasi Anda SPA/single page)
    // Jika Anda menggunakan fungsi navigasi, panggil di sini, contoh:
    // showPage('piutang'); 

    // 2. Isi kolom pencarian nama secara otomatis
    const searchInput = document.getElementById('piutang-search-nama');
    if (searchInput) {
        searchInput.value = nama;
    }

    // 3. Jalankan fungsi filter/render agar daftar ter-update sesuai nama tersebut
    if (typeof renderPiutang === 'function') {
        renderPiutang();
    }

    // 4. Tutup laci notifikasi setelah diklik
    // Ganti 'laci-notifikasi' dengan ID elemen laci Anda yang benar
    const laci = document.getElementById('laci-notifikasi') || document.querySelector('.drawer');
    if (laci) {
        // Jika laci pakai class 'active' atau 'open'
        laci.classList.remove('active');
        laci.classList.remove('open');
        // Jika laci pakai style display
        // laci.style.display = 'none';
    }

    // 5. Scroll otomatis ke list piutang agar user langsung melihat kartunya
    const piutangListElem = document.getElementById('piutang-list');
    if (piutangListElem) {
        piutangListElem.scrollIntoView({ behavior: 'smooth' });
    }
}

// 2. Fungsi Snooze (Besok/Lusa): Kartu langsung hilang
function snoozeLaci(el, nama, days, tanggalBuat) {
    // Gunakan tanggalBuat sebagai ID unik supaya tidak salah target kalau namanya sama
    console.log("Tombol diklik!", nama, days);
    const target = piutangList.find(p =>
        p.nama === nama &&
        p.tanggalBuat === tanggalBuat &&
        !p.lunas
    );

    if (target) {
        // Cara aman setting tanggal lokal (menghindari bug ISO/UTC)
        let d = new Date();
        d.setDate(d.getDate() + days);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        target.tanggal = `${yyyy}-${mm}-${dd}`;

        // Pastikan urutan ini benar
        if (typeof autoSave === "function") autoSave();

        // Refresh semua UI
        renderPiutang();
        checkDuePiutang();

        // Hilangkan notifikasi
        if (typeof tutupKartuNotifikasi === "function") {
            tutupKartuNotifikasi(el);
        }

        console.log(`Snooze ${nama} berhasil: ${target.tanggal}`);
    } else {
        console.error("Data tidak cocok. Cek apakah nama & tanggalBuat sesuai.");
    }
}

// 3. Fungsi Toggle Menu Nanti
function toggleSnoozeMenu(btn) {
    const card = btn.closest('.notif-card-laci');
    const menu = card.querySelector('.snooze-options');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}

// Initialization
window.addEventListener('DOMContentLoaded', checkDuePiutang);
function lihatDetailDariLaci(nama) {
    // 1. CARI TOMBOL NAVBAR PIUTANG
    // Kita cari elemen yang biasanya diklik user untuk buka halaman piutang
    const tombolNavPiutang = document.querySelector('.nav-item[onclick*="piutang"]') ||
        document.querySelector('button[onclick*="piutang"]') ||
        document.getElementById('nav-piutang');

    // 2. TUTUP LACI (DRAWER)
    const laci = document.getElementById('laci-notifikasi') || document.querySelector('.drawer');
    if (laci) {
        laci.classList.remove('active', 'open');
        laci.style.right = "-100%";
    }

    // 3. JALANKAN PROSES PERPINDAHAN
    if (tombolNavPiutang) {
        // Jika ketemu, KLIK otomatis (ini akan memicu SEMUA fungsi bawaan navbar)
        tombolNavPiutang.click();
    } else if (typeof showPage === 'function') {
        // Jika tidak ketemu, pakai cara manual
        showPage('piutang');
    }

    // 4. PAKSA RENDER SETELAH HALAMAN SIAP
    setTimeout(() => {
        // Masukkan nama ke kolom pencarian
        const searchInput = document.getElementById('piutang-search-nama');
        if (searchInput) {
            searchInput.value = nama;
            // Picu event agar filter berfungsi
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Jalankan render utama aplikasi
        if (typeof renderPiutang === 'function') {
            console.log("Memulai render untuk: " + nama);
            renderPiutang();
        }
    }, 300); // Beri jeda 0.3 detik agar transisi halaman selesai
}

// Fungsi Snooze (Besok/Lusa)
function snoozeLaci(el, nama, days, tanggalBuat) {
    // Gunakan tanggalBuat sebagai ID unik supaya tidak salah target kalau namanya sama
    const target = piutangList.find(p =>
        p.nama === nama &&
        p.tanggalBuat === tanggalBuat &&
        !p.lunas
    );

    if (target) {
        // Cara aman setting tanggal lokal (menghindari bug ISO/UTC)
        let d = new Date();
        d.setDate(d.getDate() + days);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        target.tanggal = `${yyyy}-${mm}-${dd}`;

        // Pastikan urutan ini benar
        if (typeof autoSave === "function") autoSave();

        // Refresh semua UI
        renderPiutang();
        checkDuePiutang();

        // Hilangkan notifikasi
        if (typeof tutupKartuNotifikasi === "function") {
            tutupKartuNotifikasi(el);
        }

        console.log(`Snooze ${nama} berhasil: ${target.tanggal}`);
    } else {
        console.error("Data tidak cocok. Cek apakah nama & tanggalBuat sesuai.");
    }
}

// Fungsi untuk memunculkan/menyembunyikan menu Besok & Lusa
function toggleSnoozeMenu(btn) {
    // Mencari elemen snooze-options yang ada di dalam kartu yang sama
    const card = btn.closest('.notif-card-laci');
    const menu = card.querySelector('.snooze-options');

    // Toggle tampilkan atau sembunyikan
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Fungsi utama untuk mengubah tanggal jatuh tempo
function snoozeLaci(nama, days) {
    const target = piutangList.find(p => p.nama === nama && !p.lunas);

    if (target) {
        let d = new Date();
        d.setDate(d.getDate() + days);
        const newDateString = d.toISOString().slice(0, 10);

        target.tanggal = newDateString; // Update tanggal ke besok/lusa

        autoSave && autoSave();
        renderPiutang();  // Update tabel di halaman piutang
        checkDuePiutang(); // Refresh Laci (Kartu akan otomatis hilang karena sudah tidak telat)

        alert(`Berhasil! Tagihan ${nama} ditunda sampai ${newDateString}`);
    }
}

function renderPiutang() {
    const list = document.getElementById('piutang-list');
    if (!list) return;

    list.style.width = "100%";
    list.style.maxWidth = "none";
    list.style.display = "block";

    const namaFilter = document.getElementById('piutang-search-nama')?.value.toLowerCase() || "";
    const tanggalFilter = document.getElementById('piutang-search-tanggal')?.value || "";
    const statusFilter = document.getElementById('filter-status-lunas')?.value || "semua";

    let filtered = piutangList.filter(p => {
        const matchNama = (p.nama || "").toLowerCase().includes(namaFilter);
        const matchTanggal = tanggalFilter ? p.tanggal === tanggalFilter : true;
        const matchStatus = statusFilter === 'semua' ? true : (statusFilter === 'sudah' ? p.lunas : !p.lunas);
        return matchNama && matchTanggal && matchStatus;
    });

    let htmlLewat = "";
    let htmlBelum = "";
    let htmlSudah = "";
    let totalBelumLunas = 0;
    const skrg = new Date().setHours(0, 0, 0, 0);

    filtered.forEach((p) => {
        if (!p.lunas) totalBelumLunas += (p.nominal || 0);
        const indexAsli = piutangList.indexOf(p);

        // --- KUNCI UTAMA: Buat ID Unik untuk Drag ---
        const cardId = p.id || "card-" + indexAsli;

        let statusDeadline = "";
        let colorDeadline = "#888";
        let kategori = "belum";

        if (p.lunas) {
            kategori = "sudah";
            statusDeadline = "✓ LUNAS";
            colorDeadline = "#2ecc71";
        } else if (p.tanggal) {
            const jatuhTempo = new Date(p.tanggal).setHours(0, 0, 0, 0);
            const selisih = Math.ceil((jatuhTempo - skrg) / (1000 * 60 * 60 * 24));
            if (selisih < 0) {
                statusDeadline = `Lewat ${Math.abs(selisih)} Hari`;
                colorDeadline = "#e74c3c";
                kategori = "lewat";
            } else if (selisih === 0) {
                statusDeadline = `Hari Ini`;
                colorDeadline = "#f39c12";
            } else {
                statusDeadline = `${selisih} Hari lagi`;
                colorDeadline = "#3498db";
            }
        }

        // --- UPDATE TEMPLATE: Tambahkan draggable='true' dan id ---
        const cardHTML = `
        <div class='card' 
             id='${cardId}' 
             draggable='true' 
             ondragstart='drag(event)'
             style='padding:20px; border-radius:15px; border:1px solid #ddd; background:#fff; display:flex; flex-direction:column; justify-content:space-between; min-height:240px; position:relative; width: 100%; box-shadow: 0 2px 5px rgba(0,0,0,0.05); cursor: grab;'>
            
            <div style="position: absolute; top: 12px; right: 15px; text-align: right; line-height: 1.2;">
                <div style="font-size: 12px; color: #aaa; font-weight: bold; text-transform: uppercase;">Dibuat:</div>
                <div style="font-size: 12px; color: #555;">${p.tglInput || p.tanggalBuat || '-'}</div>
                <div style="font-size: 12px; color: #888; font-weight: bold;">Oleh: ${p.inputOleh || 'Kasir'}</div>
            </div>

            <div>
                <div style="border-bottom:1px dashed #eee; padding-bottom:8px; margin-bottom:12px; margin-top:20px;">
                    <small style="color:#888;">TEMPO: <b style="color:${colorDeadline}">${p.tanggal || '-'}</b></small>
                    <div style="color:${colorDeadline}; font-weight:bold; font-size: 1.1em;">${statusDeadline}</div>
                </div>
                <b style="font-size:1.3em; color:#333;">${p.nama || '(Tanpa Nama)'}</b>
                <div style="margin:10px 0; color:#666; font-size:0.95em;">
                    ${(p.detail || []).map(d => `<div>${d.nama} <b style="float:right;">x${d.qty}</b></div>`).join('')}
                </div>
            </div>

            <div style="border-top:1px solid #eee; padding-top:10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 10px;">
                    <b style="color:${p.lunas ? '#2ecc71' : '#e74c3c'}; font-size:1.5em;">Rp ${(p.nominal || 0).toLocaleString('id-ID')}</b>
                    
                    ${p.lunas ? `
                        <div style="text-align: right; font-size: 12px; color: #2ecc71; line-height: 1.1;">
                            <b style="font-size: 10px; font-weight:bold; text-transform: uppercase;">Lunas Oleh:</b><br>
                            ${p.dilunaskanOleh || 'Kasir'}<br>
                            ${p.tanggalLunas || '-'}
                        </div>
                    ` : ''}
                </div>

                <div style='display:flex; gap:10px;'>
                    ${!p.lunas ? `<button class='btn-primary' style="flex:1; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick='lunasPiutang(${indexAsli})'>LUNASKAN</button>` : ''}
                </div>
            </div>
        </div>`;

        if (kategori === "lewat") htmlLewat += cardHTML;
        else if (kategori === "sudah") htmlSudah += cardHTML;
        else htmlBelum += cardHTML;
    });

    list.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; width: 100%;">
            <div style="min-width: 0;">
                <h3 style="color:#e74c3c; border-bottom:3px solid #e74c3c; padding-bottom:10px; margin-bottom:20px;">🛑 LEWAT</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    ${htmlLewat || '<p style="color:#aaa; text-align:center;">Kosong</p>'}
                </div>
            </div>
            <div style="min-width: 0;">
                <h3 style="color:#3498db; border-bottom:3px solid #3498db; padding-bottom:10px; margin-bottom:20px;">⏳ BELUM</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    ${htmlBelum || '<p style="color:#aaa; text-align:center;">Kosong</p>'}
                </div>
            </div>
            <div style="min-width: 0;">
                <h3 style="color:#2ecc71; border-bottom:3px solid #2ecc71; padding-bottom:10px; margin-bottom:20px;">✅ SUDAH LUNAS</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    ${htmlSudah || '<p style="color:#aaa; text-align:center;">Kosong</p>'}
                </div>
            </div>
        </div>
    `;
}

// JANGAN LUPA: Tambahkan fungsi pembantu ini di bawahnya
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.style.opacity = "0.5";
}

// JANGAN LUPA: Tambahkan fungsi pembantu ini di bawahnya
function drag(ev) {
    // Memastikan kita mengambil ID dari div 'card', bukan dari teks di dalamnya
    const targetCard = ev.target.closest('.card');
    if (targetCard) {
        ev.dataTransfer.setData("text", targetCard.id);
    }
}

function dropToDelete(ev) {
    ev.preventDefault();
    const idData = ev.dataTransfer.getData("text");

    // 1. Ambil nomor index dari ID "card-5" -> 5
    let indexTarget = -1;
    if (idData.startsWith('card-')) {
        indexTarget = parseInt(idData.split('-')[1]);
    } else {
        // Jika p.id adalah unik (Date.now)
        indexTarget = piutangList.findIndex(p => p.id == idData);
    }

    // 2. Eksekusi Hapus jika index ditemukan
    if (indexTarget > -1 && indexTarget < piutangList.length) {
        // Kita panggil fungsi hapusPiutang yang sudah Juragan punya di index.js baris 2043-an
        hapusPiutang(indexTarget);
    } else {
        console.error("Gagal mendeteksi index kartu:", idData);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

//drag n drop piutang
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const element = document.getElementById(data);

    // Logika jika masuk ke tempat sampah
    if (ev.target.id === "trash-zone" || ev.target.closest("#trash-zone")) {
        hapusPiutang(data); // Panggil fungsi hapus Anda
    }
}

// 1. Izin agar kartu bisa dilepas di sini
function allowDrop(ev) {
    ev.preventDefault();
    // Efek sedikit membesar saat kartu di atas tong sampah
    document.getElementById('drop-zone-delete').style.transform = "scale(1.2)";
}

// 2. Fungsi saat kartu benar-benar dilepas (Drop)
function hapusPiutang(idx) {
    if (!confirm('Hapus piutang ini, Juragan?')) return;

    // 1. Hapus dari data asli
    piutangList.splice(idx, 1);

    // 2. Simpan ke LocalStorage (Gunakan fungsi save yang ada di file Juragan)
    saveAllData();

    // 3. Update Tampilan & Badge secara berurutan
    renderPiutang();        // Gambar ulang kartu
    updatePiutangBadge();   // Update angka di Sidebar & Laci
    checkDuePiutang();      // Scan ulang jatuh tempo untuk isi laci

    console.log("Data berhasil dibersihkan!");
}

// Tambahan agar saat batal drag, ukuran kembali normal
document.addEventListener("dragend", function (event) {
    document.getElementById('drop-zone-delete').style.transform = "scale(1)";
});


//dropdown kategori 

//kategori

//resetprodukfilter
function resetProdukFilter() {
    // 3. Render ulang semua produk
    renderProduk();
}

function renderProduk() {
    filterProdukByCategory();
}

function filterProdukByCategory() {
    const list = document.getElementById('master-produk-list');
    if (!list) return;

    // Grid System: Ramping & Modern
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
    list.style.gap = "15px";
    list.style.padding = "12px";

    const cat = document.getElementById('produk-category-filter')?.value || "";
    const searchKey = (typeof kasirSearch !== 'undefined' ? kasirSearch : "").toLowerCase();
    const NO_IMG = 'https://placehold.co/200x200/e0e0e0/888888?text=No+Image';

    let filtered = produkList.filter(p => {
        const s = p.stok || 0;
        let matchCat = true;
        if (cat === 'stok habis') matchCat = s <= 0;
        else if (cat === 'hampir_habis') matchCat = s > 0 && s < 5;
        else if (cat === 'tersedia') matchCat = s >= 5;
        else if (cat) matchCat = (p.kategori || '').toLowerCase() === cat.toLowerCase();

        let matchSearch = !searchKey ||
            (p.nama || "").toLowerCase().includes(searchKey) ||
            (p.keterangan || "").toLowerCase().includes(searchKey) ||
            (p.kategori || "").toLowerCase().includes(searchKey);

        return matchCat && matchSearch;
    });

    list.innerHTML = filtered.map((p) => {
        const indexAsli = produkList.findIndex(item => item === p);
        const s = p.stok || 0;
        let warna = s <= 0 ? "#e74c3c" : (s < 5 ? "#e67e22" : "#2ecc71");
        const imgSrc = p.imgUrl || NO_IMG;

        return `
        <div class="product-card-new" style="
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            border: 1px solid #eee;
            height: 100%;
        ">
            <div style="position: relative; width: 100%; height: 150px; background: #f8f9fa;">
                <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: ${warna}; color: white; 
                    font-size: 13px; padding: 6px; 
                    text-align: center; font-weight: 900;
                    text-transform: uppercase;
                ">
                    ${s <= 0 ? 'HABIS' : 'STOK: ' + s}
                </div>
            </div>

            <div style="padding: 10px; flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">
                
                <small style="color: #94a3b8; font-size: 9px; text-transform: uppercase; font-weight: bold;">
                    ${p.kategori || 'Umum'}
                </small>
                
                <b style="
                    font-size: 15px; 
                    color: #1e293b; 
                    display: -webkit-box; 
                    -webkit-line-clamp: 1; 
                    -webkit-box-orient: vertical; 
                    overflow: hidden;
                    line-height: 1.2;
                ">
                    ${p.nama}
                </b>

                <p style="
    font-size: 11px; 
    color: #3b4149; 
    margin: 4px 0;
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical; 
    overflow: hidden;
    height: 26px;
    line-height: 1.2;
">
    ${p.ket || '<i style="color: #94a3b8">Tidak ada keterangan...</i>'}
</p>
                <div style="margin-top: auto; padding-top: 6px; border-top: 1px dashed #eee; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 14px; color: #94a3b8;">Beli:</span>
                        <span style="font-size: 12px; color: #ef4444; font-weight: 600;">Rp ${(p.hargaBeli || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; color: #64748b; font-weight: bold;">Jual:</span>
                        <span style="font-size: 20px; font-weight: 800; color: #2ecc71;">Rp ${(p.hargaJual || 0).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button onclick='openProdukModal(${indexAsli})' style="
                        flex: 1; background: #f1f5f9; border: none; 
                        padding: 6px; border-radius: 4px; color: #475569; 
                        cursor: pointer; font-size: 10px; font-weight: 700;
                    ">EDIT</button>
                    
                    <button onclick='hapusProduk(${indexAsli})' style="
                        background: #fff1f0; border: none; 
                        padding: 6px 10px; border-radius: 4px; color: #e74c3c; 
                        cursor: pointer; font-size: 10px;
                    "><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');

    if (typeof renderKasirProduk === 'function') renderKasirProduk();
}

function refreshPage() {
    // 1. Muat ulang data dasar
    if (typeof loadAllData === 'function') loadAllData();
    if (typeof updateSaldoDisplay === 'function') updateSaldoDisplay();

    // 2. Deteksi halaman aktif
    const currentPage = document.querySelector('.app-page:not([style*="display: none"])');

    if (currentPage) {
        const id = currentPage.id;

        // Refresh Halaman Produk & Reset Filter ke Semua
        if (id === 'page-produk' || id === 'produk-page') {
            const filterDropdown = document.getElementById('produk-category-filter');
            if (filterDropdown) filterDropdown.value = "";
            if (typeof kasirSearch !== 'undefined') kasirSearch = "";
            renderProduk();
        }

        // Refresh Halaman Piutang
        else if (id === 'page-piutang') {
            if (typeof renderPiutang === 'function') renderPiutang();
        }

        // Refresh Halaman Laporan
        else if (id === 'page-laporan') {
            if (typeof renderLaporan === 'function') renderLaporan();
        }

        // Refresh Halaman Kasir
        else if (id === 'page-kasir') {
            if (typeof renderKasirProduk === 'function') renderKasirProduk();
        }
    }

    // Opsional: Tampilkan notifikasi kecil daripada alert yang mengganggu
    console.log("Page refreshed successfully");
}

let touchStartPoint = 0;

window.addEventListener('touchstart', (e) => {
    // Simpan titik awal sentuhan jika user berada di paling atas halaman
    if (window.scrollY === 0) {
        touchStartPoint = e.touches[0].pageY;
    }
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const touchEndPoint = e.changedTouches[0].pageY;

    // Jika user menarik ke bawah sejauh lebih dari 150 pixel
    if (window.scrollY === 0 && touchEndPoint - touchStartPoint > 150) {
        // Jalankan fungsi refresh Anda
        refreshPage();

        // Berikan feedback visual (getaran singkat jika di HP)
        if (window.navigator.vibrate) window.navigator.vibrate(50);

        // Beritahu user data sudah diperbarui
        showToast("Data Diperbarui");
    }
}, { passive: true });

// Fungsi tambahan untuk notifikasi simpel (pengganti alert)
function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.7); color: white; padding: 10px 20px;
        border-radius: 20px; font-size: 12px; z-index: 10000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function clearSearchInput(inputId, onInputFunc) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = ""; // Mengosongkan nilai
        input.focus(); // Mengembalikan kursor

        // Sembunyikan tombol X miliknya sendiri
        const btn = input.nextElementSibling;
        if (btn && btn.classList.contains('clear-btn')) {
            btn.style.display = 'none';
        }

        // Jalankan fungsi pencarian asli dengan string kosong
        if (typeof window[onInputFunc] === 'function') {
            window[onInputFunc]("");
        }
    }
}

window.clearSearchInput = function (inputId, callbackName) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = ""; // Bersihkan teks
        input.focus();    // Fokus kembali ke kotak

        // Sembunyikan tombol X kembali
        const btn = input.nextElementSibling;
        if (btn && btn.classList.contains('clear-btn')) {
            btn.style.display = 'none';
        }

        // Jalankan fungsi refresh
        if (callbackName === 'renderPiutang') {
            renderPiutang(); // Ini akan memunculkan semua kartu piutang lagi
        }
        else if (callbackName === 'setProdukSearch') {
            renderProduk();
        }
        else if (typeof window[callbackName] === 'function') {
            window[callbackName]();
        }
    }
};

// ==========================================
// FUNGSI TUNGGAL (i1) UNTUK SEMUA TOMBOL X
// ==========================================
// 1. Fungsi Pembersih Input (Universal)
window.clearSearchInput = function (inputId, callbackName) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = ""; // Mengosongkan teks
        input.focus();    // Mengembalikan kursor ke kotak

        // Sembunyikan tombol X miliknya sendiri
        const btn = input.nextElementSibling;
        if (btn && btn.classList.contains('clear-btn')) {
            btn.style.display = 'none';
        }

        // REFRESH LIST:
        // Memastikan daftar di-refresh saat tombol clear ditekan

        if (callbackName === 'setProdukSearch') {
            setProdukSearch("");
        }
        else if (callbackName === 'handleProdukSearch') {
            handleProdukSearch("");
        }
        else if (typeof window[callbackName] === 'function') {
            window[callbackName]();
        }
    }
};

// 2. Fungsi Pencarian Produk (Halaman Daftar Produk/Table)
window.handleProdukSearch = function (query) {
    const searchTerm = query.toLowerCase();
    const tableBody = document.getElementById('produk-table-body');

    // Jika input kosong, tampilkan semua produk kembali
    if (!searchTerm) {
        renderProduk();
        return;
    }

    // Filter produkList berdasarkan nama
    const filtered = produkList.filter(p =>
        p.nama.toLowerCase().includes(searchTerm)
    );

    // Render ulang tabel dengan hasil filter saja
    tableBody.innerHTML = '';
    filtered.forEach((produk, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${produk.nama}</td>
            <td>Rp ${produk.hargaJual.toLocaleString()}</td>
            <td>${produk.stok}</td>
            <td>
                <button class="btn-edit" onclick="editProduk(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="hapusProduk(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// 3. Fungsi Pencarian Produk (Manajemen Stok/Card Display)
function setProdukSearch(query) {
    const searchTerm = query.toLowerCase();
    const list = document.getElementById('master-produk-list');
    if (!list) return;

    // Filter data
    const filtered = produkList.filter(p => p.nama.toLowerCase().includes(searchTerm));

    // Jika kosong, langsung panggil renderProduk asli dan stop
    if (searchTerm === "") {
        renderProduk();
        return;
    }

    // Render dengan struktur "Card New" Anda
    list.innerHTML = filtered.map((p) => {
        const indexAsli = produkList.findIndex(item => item === p);
        const s = p.stok || 0;
        let warna = s <= 0 ? "#e74c3c" : (s < 5 ? "#e67e22" : "#2ecc71");
        // Pastikan NO_IMG terdefinisi, atau ganti dengan placeholder string
        const imgSrc = p.imgUrl || (typeof NO_IMG !== 'undefined' ? NO_IMG : 'https://via.placeholder.com/150');

        return `
        <div class="product-card-new" style="
            background: white; border-radius: 10px; overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08); display: flex;
            flex-direction: column; border: 1px solid #eee; height: 100%;
        ">
            <div style="position: relative; width: 100%; height: 150px; background: #f8f9fa;">
                <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: ${warna}; color: white; 
                    font-size: 13px; padding: 6px; 
                    text-align: center; font-weight: 900;
                    text-transform: uppercase;
                ">
                    ${s <= 0 ? 'HABIS' : 'STOK: ' + s}
                </div>
            </div>

            <div style="padding: 10px; flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">
                <small style="color: #94a3b8; font-size: 9px; text-transform: uppercase; font-weight: bold;">
                    ${p.kategori || 'Umum'}
                </small>
                <b style="
                    font-size: 15px; color: #1e293b; display: -webkit-box; 
                    -webkit-line-clamp: 1; -webkit-box-orient: vertical; 
                    overflow: hidden; line-height: 1.2;
                ">
                    ${p.nama}
                </b>
                <p style="
                    font-size: 11px; color: #3b4149; margin: 4px 0;
                    display: -webkit-box; -webkit-line-clamp: 2; 
                    -webkit-box-orient: vertical; overflow: hidden;
                    height: 26px; line-height: 1.2;
                ">
                    ${p.ket || '<i style="color: #94a3b8">Tidak ada keterangan...</i>'}
                </p>
                <div style="margin-top: auto; padding-top: 6px; border-top: 1px dashed #eee; display: flex; flex-direction: column; gap: 2px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 14px; color: #94a3b8;">Beli:</span>
                        <span style="font-size: 12px; color: #ef4444; font-weight: 600;">Rp ${(p.hargaBeli || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px; color: #64748b; font-weight: bold;">Jual:</span>
                        <span style="font-size: 20px; font-weight: 800; color: #2ecc71;">Rp ${(p.hargaJual || 0).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button onclick='openProdukModal(${indexAsli})' style="
                        flex: 1; background: #f1f5f9; border: none; 
                        padding: 6px; border-radius: 4px; color: #475569; 
                        cursor: pointer; font-size: 10px; font-weight: 700;
                    ">EDIT</button>
                    <button onclick='hapusProduk(${indexAsli})' style="
                        background: #fff1f0; border: none; 
                        padding: 6px 10px; border-radius: 4px; color: #e74c3c; 
                        cursor: pointer; font-size: 10px;
                    "><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Tampilkan pesan jika kosong
    if (filtered.length === 0) {
        list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">Produk "${query}" tidak ditemukan</div>`;
    }
}

window.resetPiutangSearch = function () {
    const input = document.getElementById('piutang-search-nama');
    if (input) {
        input.value = ""; // Kosongkan teks
        input.focus();    // Kursor balik ke kotak
        renderPiutang();  // Tampilkan semua data lagi
    }
};

//ekspor piutang ke excel
window.exportPiutangExcel = function () {
    // 1. Ambil filter dari UI (agar data yang diekspor sama dengan yang sedang dilihat)
    const namaFilter = document.getElementById('piutang-search-nama')?.value.toLowerCase() || "";
    const tanggalFilter = document.getElementById('piutang-search-tanggal')?.value || "";
    const statusFilter = document.getElementById('filter-status-lunas')?.value || "semua";

    // 2. Gunakan logika filter yang sama dengan fungsi renderPiutang
    let dataFiltered = piutangList.filter(p => {
        const matchNama = (p.nama || "").toLowerCase().includes(namaFilter);
        const matchTanggal = tanggalFilter ? p.tanggal === tanggalFilter : true;
        const matchStatus = statusFilter === 'semua' ? true : (statusFilter === 'sudah' ? p.lunas : !p.lunas);
        return matchNama && matchTanggal && matchStatus;
    });

    if (dataFiltered.length === 0) {
        alert("Tidak ada data piutang untuk diekspor!");
        return;
    }

    // 3. Format data (Menggunakan p.nominal sesuai dengan fungsi renderPiutang Anda)
    const dataUntukExcel = dataFiltered.map((p, index) => {
        return {
            "No": index + 1,
            "Tanggal Input": p.tglInput || p.tanggalBuat || "-",
            "Jatuh Tempo": p.tanggal || "-",
            "Nama Pelanggan": p.nama || "Tanpa Nama",
            "Nominal (Rp)": p.nominal || 0, // Menggunakan p.nominal bukan p.total
            "Status": p.lunas ? "LUNAS" : "BELUM LUNAS",
            "Tanggal Lunas": p.tanggalLunas || "-",
            "Dilunaskan Oleh": p.dilunaskanOleh || "-",
            "Detail Barang": (p.detail || []).map(d => `${d.nama} (x${d.qty})`).join(', ')
        };
    });

    // 4. Proses Ekspor
    try {
        const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Piutang");

        // Atur lebar kolom agar rapi
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
        ];

        const tgl = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Laporan_Piutang_Warung_${tgl}.xlsx`);
    } catch (err) {
        console.error("Gagal ekspor:", err);
        alert("Gagal membuat file Excel.");
    }
};

//tutup kartu notif
function tutupKartuNotifikasi(btn) {
    // 1. Cari elemen kartu terdekat
    const card = btn.closest('.notif-card-laci');
    if (!card) return;

    // 2. Beri efek transisi sederhana
    card.style.transition = "0.3s";
    card.style.opacity = "0";
    card.style.transform = "scale(0.9)";

    // 3. Hapus kartu dan update angka
    setTimeout(() => {
        card.remove();

        // Update angka di bulatan merah laci
        const list = document.getElementById('laci-list');
        const countLabel = document.getElementById('laci-count');
        const remaining = list.querySelectorAll('.notif-card-laci').length;

        if (countLabel) {
            countLabel.innerText = remaining;
            // Jika kartu habis, sembunyikan bulatan merah dan laci
            if (remaining === 0) {
                countLabel.style.display = 'none';
                document.getElementById('notif-laci').style.display = 'none';
            }
        }
    }, 300);
}

//expor laporan ke excel
function exportLaporanExcel() {
    // 1. Gunakan variabel transaksiLog sesuai kodemu
    if (typeof transaksiLog === 'undefined' || transaksiLog.length === 0) {
        alert("Maaf bre, datanya kosong. Belum ada transaksi!");
        return;
    }

    // 2. Jalankan filter yang sama dengan yang ada di renderLaporan()
    let filtered = transaksiLog;
    if (typeof laporanStartDate !== 'undefined' && laporanStartDate) {
        filtered = filtered.filter(t => t.tanggal >= laporanStartDate);
    }
    if (typeof laporanEndDate !== 'undefined' && laporanEndDate) {
        filtered = filtered.filter(t => t.tanggal <= laporanEndDate);
    }

    if (filtered.length === 0) {
        alert("Tidak ada data dalam rentang tanggal ini!");
        return;
    }

    // 3. Mapping data agar kolom Excel-nya rapi (sesuai header tabel kamu)
    const dataFormatted = filtered.map((t, index) => ({
        "No": index + 1,
        "Tanggal": t.tanggal,
        "Kasir": t.kasir || '-',
        "Jenis": t.jenis,
        "Nominal (Rp)": t.nominal,
        "Modal (Rp)": t.modalTotal || 0,
        "Keterangan": t.ket || '',
        "Pembeli": t.pembeli || ''
    }));

    // 4. Proses Ekspor ke Excel
    try {
        const worksheet = XLSX.utils.json_to_sheet(dataFormatted);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");

        // Atur lebar kolom (opsional tapi biar cantik)
        worksheet['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
            { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }
        ];

        // 5. Download File
        const fileName = `Laporan_Warung_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    } catch (e) {
        console.error(e);
        alert("Gagal ekspor! Pastikan library SheetJS (xlsx.full.min.js) sudah terpasang.");
    }
}

function updateLaporan() {
    const tableBody = document.getElementById('laporan-table-body');
    if (!tableBody) return;

    // 1. Ambil data (asumsikan kita pakai semua data log)
    let filtered = [...transaksiLog];

    // 2. Variabel Hitung-hitungan
    let omzetJualan = 0;
    let uangRestok = 0;

    filtered.forEach(t => {
        const nominal = parseFloat(t.nominal) || 0;
        const keterangan = (t.ket || "").toLowerCase();

        // Hitung Omzet (Hanya dari Penjualan)
        if (t.jenis === 'Masuk' && keterangan.includes('penjualan')) {
            omzetJualan += nominal;
        }

        // Hitung Restok (Hanya jika ada kata 'beli' atau 'stok')
        if (t.jenis === 'Keluar' && (keterangan.includes('beli') || keterangan.includes('stok'))) {
            uangRestok += nominal;
        }
    });

    // 3. Hitung Profit Riil (Sisa uang di laci)
    let profitRiil = omzetJualan - uangRestok;

    // 4. Update ke Tabel Mini (Gunakan ID yang sesuai di HTML)
    if (document.getElementById('mini-omzet')) {
        document.getElementById('mini-omzet').innerText = `Rp ${omzetJualan.toLocaleString('id-ID')}`;
        document.getElementById('mini-restok').innerText = `Rp ${uangRestok.toLocaleString('id-ID')}`;
        document.getElementById('mini-profit').innerText = `Rp ${profitRiil.toLocaleString('id-ID')}`;
    }

    // (Sisa kode untuk merender tabel laporan utama tetap di bawah sini)
    renderLaporanTable(filtered);
}

//riwayat kas
function openMutasiPage() {
    // Memastikan tabel terisi data terbaru sebelum pindah halaman
    if (typeof renderLogMutasi === 'function') {
        renderLogMutasi();
    }
    // Pindah ke halaman riwayat kas manual
    showPage('page-log-mutasi');
}

function exportMutasiExcel() {
    if (!logKasMutasi || logKasMutasi.length === 0) {
        alert("Tidak ada data mutasi untuk diekspor!");
        return;
    }

    let csvContent = "Tanggal,Waktu,Jenis,Nominal,Keterangan\n";
    logKasMutasi.forEach(m => {
        csvContent += `'${m.tanggal},${m.waktu},${m.jenis},${m.nominal},"${m.keterangan}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Riwayat_Mutasi_Kas.csv");
    link.click();
}

const daftarKasir = [...new Set(logKasMutasi.map(item => item.kasir || 'User'))];
const dropdownKasirHTML = `
    <select id="filter-kas-user" onchange="filterRiwayatKas()" 
        style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">
        <option value="Semua">Semua Kasir</option>
        ${daftarKasir.map(nama => `<option value="${nama}">${nama}</option>`).join('')}
    </select>
`;
/**
 * RENDER UTAMA: Menampilkan Layout, Filter, dan Tabel
 * Kita pecah menjadi dua bagian: Frame Utama dan Fungsi Mapping Baris
 */
function renderLogMutasi() {
    const list = document.getElementById('mutasi-list');
    if (!list) return;

    // A. Cari daftar kasir unik untuk isi dropdown
    const daftarKasir = [...new Set(logKasMutasi.map(m => m.kasir || 'User'))];
    const dropdownKasirHTML = `
        <select id="filter-kas-user" onchange="filterRiwayatKas()" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; flex: 1;">
            <option value="Semua">Semua Kasir</option>
            ${daftarKasir.map(k => `<option value="${k}">${k}</option>`).join('')}
        </select>
    `;

    // 1. Frame Utama (Header & Filter UI)
    const headerHTML = `
    <div id="container-kas" style="padding: 10px;">
        <h3 id="kas-header" style="text-align:left; margin:10px;">filter pencarian</h3>

        <div id="filter-kas-container" style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #ddd; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 10px; align-items: left; justify-content: center;">
            <div style="position: relative; flex: 2; min-width: 100px;">
                <input type="text" id="filter-kas-nama" placeholder="Cari keterangan..." 
                    oninput="filterRiwayatKas()" 
                    style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
            </div>

            <select id="filter-kas-jenis" onchange="filterRiwayatKas()" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; flex: 1;">
                <option value="Semua">Semua Jenis</option>
                <option value="MASUK">Uang Masuk</option>
                <option value="KELUAR">Uang Keluar</option>
            </select>

            ${dropdownKasirHTML}

            <div style="display: flex; gap: 5px; align-items: center; flex: 1.5;">
                <span>Dari tanggal:</span><input type="date" id="filter-kas-start" onchange="filterRiwayatKas()" style="padding: 8px; border-radius: 8px; border: 1px solid #ddd; width: 100%;">
                <span>-</span>
                <span>sampai tanggal:</span><input type="date" id="filter-kas-end" onchange="filterRiwayatKas()" style="padding: 8px; border-radius: 8px; border: 1px solid #ddd; width: 100%;">
            </div>
            <button onclick="resetSemuaFilterKas()" 
                id="resetfilterkas" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Reset
            </button>
        </div>


        <div class="table-container" style="background: white; border-radius: 10px; border: 1px solid #ddd; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <table id="tabel-mutasi-kas" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa; text-align: left; border-bottom: 2px solid #eee;">
                        <th style="padding: 16px; color: #495057; width: 110px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Waktu</th>
                        <th style="padding: 16px; color: #495057; width: 100px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Jenis</th>
                        <th style="padding: 16px; text-align: right; color: #495057; width: 160px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Nominal</th>
                        <th style="padding: 16px; color: #495057; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Keterangan</th>
                        <th style="padding: 16px; color: #495057; width: 100px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">User</th>
                    </tr>
                </thead>
                <tbody id="tbody-mutasi">
                    ${mapMutasiKeBaris(logKasMutasi)}
                </tbody>
            </table>
        </div>
    </div>`;

    list.innerHTML = headerHTML;
}

function mapMutasiKeBaris(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return '<tr><td colspan="5" style="text-align:center; padding:40px; color:#aaa;">Belum ada riwayat mutasi.</td></tr>';
    }

    return dataArray.slice().reverse().map((m) => `
        <tr class="mutasi-row" style="border-bottom: 1px solid #eee;">
            <td class="col-tgl" style="padding: 15px; font-size: 0.9em; color: #666;">
                <strong>${m.tanggal}</strong><br>${m.waktu}
            </td>
            <td class="col-jenis" style="padding: 15px; font-weight:bold; color:${m.jenis.toUpperCase() === 'MASUK' ? '#2ecc71' : '#e74c3c'};">
                ${m.jenis.toUpperCase()}
            </td>
            <td style="padding: 15px; text-align: right; font-weight:bold; color: #2c3e50; white-space: nowrap;">
                Rp ${Number(m.nominal).toLocaleString('id-ID')}
            </td>
            <td class="col-ket" style="padding: 15px; color: #34495e;">${m.keterangan}</td>
            <td class="col-user" style="padding: 15px; font-weight: bold; color: #7f8c8d;">${m.kasir || 'User'}</td>
        </tr>
    `).join('');
}

function filterRiwayatKas() {
    const keyword = document.getElementById('filter-kas-nama').value.toLowerCase().trim();
    const jenis = document.getElementById('filter-kas-jenis').value.toUpperCase();
    const kasir = document.getElementById('filter-kas-user').value; // Ambil nilai kasir
    const tglStart = document.getElementById('filter-kas-start').value;
    const tglEnd = document.getElementById('filter-kas-end').value;

    const rows = document.querySelectorAll('.mutasi-row');

    rows.forEach(row => {
        const teksKet = row.querySelector('.col-ket').innerText.toLowerCase();
        const teksJenis = row.querySelector('.col-jenis').innerText.trim().toUpperCase();
        const teksUser = row.querySelector('.col-user').innerText.trim(); // Ambil teks user dari tabel
        const teksTgl = row.querySelector('.col-tgl').innerText.substring(0, 10).trim();

        const cocokNama = teksKet.includes(keyword);
        const cocokJenis = (jenis === "SEMUA") || (teksJenis === jenis);
        const cocokUser = (kasir === "Semua") || (teksUser === kasir); // Logika filter kasir

        let cocokTgl = true;
        if (tglStart && teksTgl < tglStart) cocokTgl = false;
        if (tglEnd && teksTgl > tglEnd) cocokTgl = false;

        row.style.display = (cocokNama && cocokJenis && cocokUser && cocokTgl) ? "" : "none";
    });
}

function resetSemuaFilterKas() {
    document.getElementById('filter-kas-nama').value = "";
    document.getElementById('filter-kas-jenis').value = "Semua";
    document.getElementById('filter-kas-user').value = "Semua"; // Reset dropdown kasir
    document.getElementById('filter-kas-start').value = "";
    document.getElementById('filter-kas-end').value = "";

    filterRiwayatKas();
}


function prosesPemasukan() {
    const nominalInput = document.getElementById('pem-nominal').value;
    const ketInput = document.getElementById('pem-ket').value;
    const jenisInput = document.getElementById('pem-jenis').value; // Dropdown: "Masuk" atau "Keluar"

    let nominal = parseFloat(nominalInput);
    const petugasAktif = localStorage.getItem('activeUser') || "Kasir";

    if (isNaN(nominal) || nominal === 0) return alert("Masukkan nominal!");
    if (!ketInput) return alert("Isi keterangan!");

    // --- LOGIKA SAKTI DROPDOWN ---
    // Jika dropdown pilih 'Keluar', paksa nominal jadi negatif agar memotong saldo
    if (jenisInput === 'Keluar' && nominal > 0) {
        nominal = -Math.abs(nominal);
    } else if (jenisInput === 'Masuk' && nominal < 0) {
        nominal = Math.abs(nominal); // Jika tak sengaja ketik minus di Kas Masuk, jadi plus
    }

    const sekarang = new Date();
    const jamMenit = sekarang.getHours().toString().padStart(2, '0') + ":" + sekarang.getMinutes().toString().padStart(2, '0');

    const dataBaru = {
        id: Date.now(),
        tanggal: sekarang.toISOString().slice(0, 10),
        waktu: jamMenit,
        jenis: nominal > 0 ? 'Masuk' : 'Keluar',
        nominal: Math.abs(nominal), // Di tabel tetap angka positif agar rapi
        keterangan: ketInput,
        kasir: petugasAktif
    };

    // Update Saldo (Sekarang sudah benar karena nominal sudah dipaksa minus jika Keluar)
    saldo = Number(saldo) + nominal;

    logKasMutasi.push(dataBaru);

    // Simpan Permanen
    localStorage.setItem('warungan_mutasi_kas', JSON.stringify(logKasMutasi));
    localStorage.setItem('saldo', saldo.toString());

    // Update Tampilan
    updateSaldoDisplay();
    renderLogMutasi();

    alert(`Berhasil! ${dataBaru.jenis} Rp ${dataBaru.nominal.toLocaleString()} dicatat.`);

    // Reset & Balik Dashboard
    document.getElementById('pem-nominal').value = '';
    document.getElementById('pem-ket').value = '';
    showPage('page-saldo');
}

//new feature
function renderGalon() {


    const list = document.getElementById('galon-list');
    const head = document.getElementById('galon-header-status');
    if (!list) return;

    // 1. COUNTER REAL TIME (Sisa Galon di Toko)
    const maxKapasitas = maxStok.galon; // Pakai data dari editor
    const dipinjam = galonData.filter(d => d.wadah === 'Pinjam').length;
    const sisaWadah = maxKapasitas - dipinjam;

    if (head) {
        const warnaStatus = (sisaWadah === maxKapasitas) ? '#2ecc71' : '#e74c3c';
        head.innerHTML = `Sisa Wadah: <span style="color:${warnaStatus}; font-weight:bold;">${sisaWadah} / ${maxKapasitas}</span>`;
    }

    if (galonData.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999; padding:20px;">Belum ada catatan galon.</p>';
        return;
    }

    // 2. RENDER KARTU (Tanpa angka kuning, tanpa timer)
    list.innerHTML = galonData.map((d, i) => {
        const isIsi = d.isi === 'Ambil';
        const isWadah = d.wadah === 'Tukar';
        const isBayar = d.bayar === 'Lunas';

        return `
        <div class="card-item" id="card-galon-${i}" style="background:white; padding:15px; border-radius:15px; border-left: 5px solid ${isWadah ? '#2ecc71' : '#e74c3c'}; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong style="font-size:16px; color:#2c3e50;">${d.nama}</strong><br>
                    <small style="color:#aaa;">${d.tgl}</small>
                </div>
                <i class="fas fa-trash-alt" onclick="hapusCatatanGalon(${i})" style="color:#ddd; cursor:pointer; padding:5px;"></i>
            </div>
            
            <div style="display:flex; gap:25px; margin-top:15px; padding-top:10px; border-top:1px solid #f9f9f9;">
                <i class="fas fa-tint" onclick="toggleStatusCard(${i}, 'isi')" style="font-size:22px; cursor:pointer; color:#3498db; ${isIsi ? 'opacity:1; filter:grayscale(0%);' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
                <i class="fas fa-wine-bottle" onclick="toggleStatusCard(${i}, 'wadah')" style="font-size:22px; cursor:pointer; color:#e67e22; ${isWadah ? 'opacity:1; filter:grayscale(0%);' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
                <i class="fas fa-dollar-sign" onclick="toggleStatusCard(${i}, 'bayar')" style="font-size:22px; cursor:pointer; color:#2ecc71; ${isBayar ? 'opacity:1; filter:grayscale(0%);' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
            </div>
        </div>`;
    }).join('');
}

//koin sfx

function renderKoin() {
    const list = document.getElementById('koin-list');
    if (!list) return; // Safety check

    // Pakai galonData, bukan koinData!
    list.innerHTML = galonData.map((d, i) => {
        let icons = "";
        // Gambar icon koin sebanyak jumlah stok
        for (let j = 0; j < d.jumlah; j++) {
            icons += '<i class="fas fa-coins" style="color:#f1c40f; margin-right:3px;"></i>';
        }

        return `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:15px;">
                <b>${d.nama}</b><br>
                ${icons || '<small style="color:#999;">Kosong</small>'}
            </td>
            <td style="padding:15px; text-align:right;">
                <button onclick="upKoin(${i},-1)" style="padding:8px 12px; border:1px solid #ddd; border-radius:4px;">-</button>
                <button onclick="upKoin(${i}, 1)" style="padding:8px 12px; background:#2ecc71; color:white; border:none; border-radius:4px; margin-left:5px;">+</button>
            </td>
        </tr>`;
    }).join('');
}

function upKoin(index, delta) {
    // 1. Mainkan suara koin (Panggil fungsi playSound yang sudah kita buat tadi)
    playSound('coin.mp3');

    // 2. Gunakan galonData (sesuai dengan let galonData di baris atas index.js)
    if (galonData[index]) {
        galonData[index].jumlah = (galonData[index].jumlah || 0) + delta;

        // Jangan biarkan minus
        if (galonData[index].jumlah < 0) galonData[index].jumlah = 0;

        // 3. Simpan ke LocalStorage pakai key 'w_galon' (sesuai inisialisasi Juragan)
        localStorage.setItem('w_galon', JSON.stringify(galonData));

        // 4. Update tampilan
        renderKoin();
    }
}

// --- FUNGSI ACTION ---
function openInvModal(type) {
    // 1. BERSIHKAN INPUT NAMA SETIAP KALI TOMBOL + DIKLIK
    const nameInput = document.getElementById('inv-nama-input');
    if (nameInput) nameInput.value = '';

    targetInv = type;
    document.getElementById('inv-title').innerText = type === 'galon' ? 'Catat Galon' : 'Catat Gas';

    // 2. Reset status icon ke awal (Pending/Pinjam/Hutang)
    currentStatus = { isi: 'Pending', wadah: 'Pinjam', bayar: 'Hutang' };
    resetInvIcons();

    // 3. Baru munculkan modalnya
    document.getElementById('modal-inv').style.display = 'flex';
}

function closeInvModal() {
    document.getElementById('modal-inv').style.display = 'none';

    // Bersihkan lagi buat jaga-jaga
    document.getElementById('inv-nama-input').value = '';
}

function simpanInv() {
    const entry = {
        id: "ID-" + Date.now(), // ID Unik berdasarkan detik klik
        nama: document.getElementById('inv-nama-input').value || 'Pelanggan',
        tgl: new Date().toLocaleString('id-ID'),
        isi: currentStatus.isi,
        wadah: currentStatus.wadah,
        bayar: currentStatus.bayar
    };

    if (targetInv === 'galon') {
        galonData.push(entry);
    } else {
        gasData.push(entry);
    }

    saveSemuaInv();
    renderGalon(); // Langsung gambar ulang
    closeInvModal();
}

function upKoin(index, delta) {
    // Jalankan suara dulu
    playSound('click.mp3');

    // Update Data
    if (galonData && galonData[index]) {
        // Gunakan Number() untuk memastikan tidak jadi teks
        let jumlahSekarang = Number(galonData[index].jumlah) || 0;
        galonData[index].jumlah = jumlahSekarang + delta;

        // Cegah minus
        if (galonData[index].jumlah < 0) galonData[index].jumlah = 0;

        // Simpan ke memori
        localStorage.setItem('w_galon', JSON.stringify(galonData));

        // Refresh tampilan
        renderKoin();
    }
}


function tambahPenabung() {
    const n = prompt("Nama Penabung:");
    if (n) { koinData.push({ nama: n, jumlah: 0 }); localStorage.setItem('w_koin', JSON.stringify(koinData)); renderKoin(); }
}
// Render Gas mirip Galon, sesuaikan ID-nya saja.

//galon +
// Status awal (false = abu-abu/hutang)
let invStatus = { isi: false, wadah: false, bayar: false };

function openInvModal(type) {
    targetInv = type;
    invStatus = { isi: false, wadah: false, bayar: false }; // Reset

    const input = document.getElementById('inv-nama-input');
    input.value = '';

    // Ganti icon wadah jika gas
    const wadahIcon = document.getElementById('wadah-img');
    wadahIcon.className = type === 'galon' ? 'fas fa-bottle-water' : 'fas fa-fire-burner';

    // Reset visual icon ke abu-abu
    ['isi', 'wadah', 'bayar'].forEach(id => {
        document.getElementById('icon-' + id).style.filter = 'grayscale(100%)';
        document.getElementById('icon-' + id).style.opacity = '0.4';
    });

    document.getElementById('inv-title').innerText = "Catat " + (type === 'galon' ? 'Galon' : 'Gas');
    document.getElementById('modal-inv').style.display = 'flex';
}

function toggleIcon(type) {
    invStatus[type] = !invStatus[type];
    const el = document.getElementById('icon-' + type);

    if (invStatus[type]) {
        el.style.filter = 'grayscale(0%)'; // Berwarna
        el.style.opacity = '1';
    } else {
        el.style.filter = 'grayscale(100%)'; // Abu-abu
        el.style.opacity = '0.4';
    }
}

function simpanInv() {
    const nama = document.getElementById('inv-nama-input').value;
    if (!nama) return alert("Nama pelanggan wajib diisi!");

    const data = {
        nama: nama,
        isi: invStatus.isi ? 'Ambil' : 'Pending',
        wadah: invStatus.wadah ? 'Tukar' : 'Pinjam',
        bayar: invStatus.bayar ? 'Lunas' : 'Hutang',
        tgl: new Date().toLocaleDateString('id-ID'),
        timestamp: Date.now()
    };

    if (targetInv === 'galon') galonData.push(data);
    else gasData.push(data);

    saveSemuaInv();
    updateDebtBadge(); // Update jumlah notifikasi

    if (targetInv === 'galon') renderGalon(); else renderGas();
    document.getElementById('modal-inv').style.display = 'none';
}

// Fungsi menghitung notifikasi hutang (both galon and gas)
function updateDebtBadge() {
    // 1. Hitung hutang Galon (Data yang belum tuntas)
    const hutangGalon = galonData.filter(d =>
        d.isi !== 'Ambil' || d.wadah !== 'Tukar' || d.bayar !== 'Lunas'
    ).length;

    // 2. Hitung hutang Gas (Data yang belum tuntas)
    const hutangGas = (typeof gasData !== 'undefined') ? gasData.filter(d =>
        d.isi !== 'Ambil' || d.wadah !== 'Tukar' || d.bayar !== 'Lunas'
    ).length : 0;

    // 3. Cari elemen menu berdasarkan teksnya (Cara paling aman)
    const menuLinks = document.querySelectorAll('.sidebar li');

    menuLinks.forEach(link => {
        if (link.innerText.includes('Galon')) {
            updateElementBadge(link, hutangGalon);
        }
        if (link.innerText.includes('Gas')) {
            updateElementBadge(link, hutangGas);
        }
    });
}

// Fungsi pembantu biar kode bersih
function updateElementBadge(element, count) {
    if (!element) return;
    let badge = element.querySelector('.badge-notif');

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge-notif';
            Object.assign(badge.style, {
                background: '#e74c3c', color: 'white', borderRadius: '50%',
                padding: '2px 7px', fontSize: '11px', marginLeft: '10px', fontWeight: 'bold'
            });
            element.appendChild(badge);
        }
        badge.innerHTML = count;
    } else if (badge) {
        badge.remove();
    }
}

function saveSemuaInv() {
    localStorage.setItem('w_galon', JSON.stringify(galonData));
    localStorage.setItem('w_gas', JSON.stringify(gasData));
}

//for galon page visible
// Run this on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDebtBadge();
});

//new logic for the galon page
// Fungsi klik icon di kartu
let galonTimers = {}; // Tempat menyimpan ID timer

function toggleStatusCard(index, field) {
    const item = galonData[index];
    if (!item) return;

    if (field === 'isi') item.isi = (item.isi === 'Ambil' ? 'Pending' : 'Ambil');
    if (field === 'wadah') item.wadah = (item.wadah === 'Tukar' ? 'Pinjam' : 'Tukar');
    if (field === 'bayar') item.bayar = (item.bayar === 'Lunas' ? 'Hutang' : 'Lunas');

    // Jika 3 icon nyala semua, langsung hapus dari array
    if (item.isi === 'Ambil' && item.wadah === 'Tukar' && item.bayar === 'Lunas') {
        galonData.splice(index, 1);
    }

    saveSemuaInv();
    renderGalon();
    updateDebtBadge();
}

function startAutoDelete(displayIndex, realIndex) {
    let secondsLeft = 120; // 2 Menit
    const timerElement = document.getElementById(`timer-${displayIndex}`);

    // Hapus timer lama jika ada
    if (galonTimers[displayIndex]) clearInterval(galonTimers[displayIndex]);

    galonTimers[displayIndex] = setInterval(() => {
        secondsLeft--;

        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        if (timerElement) {
            timerElement.innerText = `Selesai! Menghapus dalam ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        if (secondsLeft <= 0) {
            clearInterval(galonTimers[displayIndex]);
            // Eksekusi hapus permanen
            galonData.splice(realIndex, 1);
            saveSemuaInv();
            renderGalon();
            updateDebtBadge();
        }
    }, 1000);
}

function stopAutoDelete(displayIndex) {
    if (galonTimers[displayIndex]) {
        clearInterval(galonTimers[displayIndex]);
        delete galonTimers[displayIndex];
    }
}

// Fungsi tombol sampah manual
function hapusCatatanGalon(index) {
    const realIndex = galonData.length - 1 - index;
    if (confirm("Hapus catatan ini?")) {
        galonData.splice(realIndex, 1);
        saveSemuaInv();
        renderGalon();
        updateDebtBadge();
    }
}

//galon editor max
// Ambil data max dari storage, kalau gak ada set default 50 dan 30
let maxStok = JSON.parse(localStorage.getItem('maxStok')) || { galon: 50, gas: 30 };
let currentEditType = 'galon';

function openMaxEditor(type) {
    currentEditType = type;
    document.getElementById('input-max-stok').value = maxStok[type];
    document.getElementById('modal-max-stok').style.display = 'flex';
}

function simpanMaxStok() {
    const newVal = parseInt(document.getElementById('input-max-stok').value);
    if (newVal > 0) {
        maxStok[currentEditType] = newVal;
        localStorage.setItem('maxStok', JSON.stringify(maxStok)); // Simpan ke memori
        document.getElementById('modal-max-stok').style.display = 'none';

        // Refresh tampilan
        if (currentEditType === 'galon') renderGalon();
        else renderGas();
    }
}

//now for the gas
function renderGas() {
    const list = document.getElementById('gas-list');
    const head = document.getElementById('gas-header-status');
    if (!list) return;

    // Hitung Stok Real-time (Versi Max Editor)
    const maxKapasitas = (typeof maxStok !== 'undefined') ? maxStok.gas : 20;
    const dipinjam = gasData.filter(d => d.wadah === 'Pinjam').length;
    const sisaTabung = maxKapasitas - dipinjam;
    const warnaStatus = (sisaTabung === maxKapasitas) ? '#2ecc71' : '#e74c3c';

    if (head) {
        head.innerHTML = `Tabung di Toko: <span style="color:${warnaStatus}; font-weight:bold;">${sisaTabung} / ${maxKapasitas}</span>`;
    }

    if (gasData.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999; padding:20px;">Belum ada catatan gas.</p>';
        return;
    }

    // Render kartu dengan urutan terbaru di atas
    list.innerHTML = gasData.slice().reverse().map((d, i) => {
        const isIsi = d.isi === 'Ambil';
        const isWadah = d.wadah === 'Tukar';
        const isBayar = d.bayar === 'Lunas';

        return `
<div class="card-item" style="background:white; padding:15px; border-radius:15px; border-bottom: 4px solid ${isWadah ? '#2ecc71' : '#e74c3c'}; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
            <strong style="font-size:16px;">${d.nama}</strong><br>
            <small style="color:#aaa;">${d.tgl}</small>
        </div>
        <i class="fas fa-trash-can" onclick="hapusCatatanGas(${i})" style="color:#eee; cursor:pointer;"></i>
    </div>
    <div style="display:flex; gap:25px; margin-top:15px;">
        <i class="fas fa-droplet" onclick="toggleStatusGas(${i}, 'isi')" style="font-size:22px; cursor:pointer; color:#3498db; ${isIsi ? 'opacity:1;' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
        <i class="fas fa-fire-burner" onclick="toggleStatusGas(${i}, 'wadah')" style="font-size:22px; cursor:pointer; color:#e67e22; ${isWadah ? 'opacity:1;' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
        <i class="fas fa-circle-dollar-to-slot" onclick="toggleStatusGas(${i}, 'bayar')" style="font-size:22px; cursor:pointer; color:#2ecc71; ${isBayar ? 'opacity:1;' : 'opacity:0.2; filter:grayscale(100%);'}"></i>
    </div>
</div>`;
    }).join('');
}

function toggleStatusGas(index, field) {
    // Balik index karena kita pakai .reverse() di render
    const realIndex = gasData.length - 1 - index;
    const item = gasData[realIndex];
    if (!item) return;

    if (field === 'isi') item.isi = (item.isi === 'Ambil' ? 'Pending' : 'Ambil');
    if (field === 'wadah') item.wadah = (item.wadah === 'Tukar' ? 'Pinjam' : 'Tukar');
    if (field === 'bayar') item.bayar = (item.bayar === 'Lunas' ? 'Hutang' : 'Lunas');

    // AUTO-DELETE INSTAN: Jika 3 icon nyala semua, langsung hapus
    if (item.isi === 'Ambil' && item.wadah === 'Tukar' && item.bayar === 'Lunas') {
        gasData.splice(realIndex, 1);
    }

    saveSemuaInv();
    renderGas(); // Gambar ulang halaman gas
    updateDebtBadge(); // Update notifikasi angka merah di sidebar
}

function hapusCatatanGas(index) {
    // ALERT KONFIRMASI
    if (confirm("Hapus catatan gas ini?")) {
        gasData.splice(index, 1);
        saveSemuaInv();
        renderGas();
        updateDebtBadge();
    }
}

//koin malas logic

function renderKoin() {
    const list = document.getElementById('koin-list');
    if (!list) return;

    list.innerHTML = koinData.slice().reverse().map((d, i) => {
        const realIndex = koinData.length - 1 - i;

        // HITUNG RUPIAH (Contoh: 3 koin = 1.500)
        const totalRupiah = d.jumlah * 500;
        const formatRupiah = totalRupiah.toLocaleString('id-ID');

        return `
        <div class="card-item koin-card" style="background:white; padding:15px; border-radius:15px; margin-bottom:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); position:relative; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <strong style="font-size:18px; color:#2c3e50;">${d.nama}</strong>
                        <span style="background:#f1c40f; color:#fff; padding:2px 10px; border-radius:12px; font-size:13px; font-weight:bold;">
                           <i class="fas fa-coins"></i> ${d.jumlah}
                        </span>
                    </div>
                    <div style="margin-top:5px; color:#27ae60; font-size:16px; font-weight:bold;">
                        Rp ${formatRupiah}
                    </div>
                </div>
                
                <i class="fas fa-trash-can" onclick="hapusPenabungKoin(${realIndex})" style="color:#ddd; cursor:pointer; padding:5px; font-size:18px;"></i>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:15px; border-top: 1px solid #f9f9f9; padding-top:15px;">
    <button onclick="playSound('coin.mp3'); upKoin(${realIndex}, 1)" class="btn-aksi-koin" style="background:#2ecc71;">
        <i class="fas fa-plus"></i> TAMBAH
    </button>
    
    <button onclick="playSound('back.mp3'); upKoin(${realIndex}, -1)" class="btn-aksi-koin" style="background:#e74c3c;">
        <i class="fas fa-minus"></i> KURANG
    </button>
</div>
        </div>`;
    }).join('');
}

// Fungsi Buka Modal (Bukan Alert)
function tambahPenabung() {
    document.getElementById('input-nama-koin').value = '';
    document.getElementById('modal-koin').style.display = 'flex';
}

function simpanPenabungKoin() {
    const nama = document.getElementById('input-nama-koin').value;
    if (nama) {
        koinData.push({ nama: nama, jumlah: 0 });
        localStorage.setItem('w_koin', JSON.stringify(koinData));
        document.getElementById('modal-koin').style.display = 'none';
        renderKoin();
    }
}

// Fungsi Hapus dengan Konfirmasi
function hapusPenabungKoin(realIndex) {
    if (confirm(`Hapus tabungan ${koinData[realIndex].nama}?`)) {
        koinData.splice(realIndex, 1);
        localStorage.setItem('w_koin', JSON.stringify(koinData));
        renderKoin();
    }
}

function upKoin(realIndex, val) {
    koinData[realIndex].jumlah += val;
    if (koinData[realIndex].jumlah < 0) koinData[realIndex].jumlah = 0;
    localStorage.setItem('w_koin', JSON.stringify(koinData));
    renderKoin();
}
//refersh tombol navbar
function refreshSemuaData() {
    // 1. Tambah animasi putar pada icon
    const icon = document.getElementById('icon-refresh');
    if (icon) icon.classList.add('fa-spin');

    // 2. Panggil semua fungsi render yang kita punya
    if (typeof renderGalon === 'function') renderGalon();
    if (typeof renderGas === 'function') renderGas();
    if (typeof renderKoin === 'function') renderKoin();

    // 3. Update badge notifikasi di sidebar
    if (typeof updateDebtBadge === 'function') updateDebtBadge();

    // 4. Hilangkan animasi putar setelah 0.5 detik
    setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
        // Optional: Munculkan notifikasi kecil
        console.log("Data berhasil disegarkan!");
    }, 500);
}

//pull To refresh
let startY = 0;
const pullToRefresh = document.getElementById('pull-to-refresh');

window.addEventListener('touchstart', (e) => {
    // Hanya aktif jika posisi scroll ada di paling atas
    if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
    }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    const moveY = e.touches[0].pageY;
    const pullDistance = moveY - startY;

    // Jika ditarik ke bawah lebih dari 70px dan posisi di atas
    if (pullDistance > 70 && window.scrollY === 0) {
        pullToRefresh.style.display = 'flex';
    }
}, { passive: true });



//user new sakit pala ajg
function selectUser(nama) {
    // Simpan ke memori HP agar bisa di-scan fungsi lain
    localStorage.setItem('activeUser', nama);

    // Update tampilan di Welcome Screen (pastikan ID-nya 'user-name')
    const userDisplay = document.getElementById('user-name');
    if (userDisplay) userDisplay.innerText = "Halo, " + nama.charAt(0).toUpperCase() + nama.slice(1);

    // Tutup modal dan masuk ke dashboard
    document.getElementById('user-modal').style.display = 'none';
    showPage('page-saldo');
}

//laste mate user welcome
function updateWelcomeDisplay() {
    const user = localStorage.getItem('activeUser') || "KASIR";
    const el = document.getElementById('welcome-user');
    if (el) {
        el.innerText = user.toUpperCase();
    }
}

// Panggil setiap kali ganti user
function selectUser(nama) {
    localStorage.setItem('activeUser', nama);
    updateWelcomeDisplay();
    document.getElementById('user-modal').style.display = 'none';
    showPage('page-saldo');
}

// Jalankan saat aplikasi pertama kali dimuat
window.addEventListener('DOMContentLoaded', updateWelcomeDisplay);

//cadangkan download txt/json 
// --- FUNGSI 1: SIMPAN DATA KE FILE .JSON ---
function downloadCadangan() {
    const dataWarung = {
        saldo: localStorage.getItem('warungan_saldo') || '0',
        mutasi: JSON.parse(localStorage.getItem('warungan_mutasi_kas')) || [],
        laporan: JSON.parse(localStorage.getItem('warungan_laporan_penjualan')) || [],
        produk: JSON.parse(localStorage.getItem('warungan_produk')) || [],
        piutang: typeof piutangList !== 'undefined' ? piutangList : (JSON.parse(localStorage.getItem('warungan_piutang')) || []),
        galon: JSON.parse(localStorage.getItem('w_galon')) || [],
        gas: JSON.parse(localStorage.getItem('w_gas')) || [],
        koin: JSON.parse(localStorage.getItem('w_koin')) || [],
        waktu: new Date().toLocaleString('id-ID')
    };

    const dataStr = JSON.stringify(dataWarung, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `CADANGAN_WARUNG_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

// --- FUNGSI 2: TRIGGER PILIH FILE ---
function triggerFileInput() {
    document.getElementById('fileInputCadangan').click();
}

// --- FUNGSI 3: MUAT DATA DARI FILE .JSON ---
function muatCadangan(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // Konfirmasi ke user
            if (confirm("Hati-hati! Data saat ini akan diganti dengan data dari file cadangan. Lanjutkan?")) {
                // Masukkan semua ke LocalStorage
                if (data.saldo) localStorage.setItem('warungan_saldo', data.saldo);
                if (data.mutasi) localStorage.setItem('warungan_mutasi_kas', JSON.stringify(data.mutasi));
                if (data.laporan) localStorage.setItem('warungan_laporan_penjualan', JSON.stringify(data.laporan));
                if (data.produk) localStorage.setItem('warungan_produk', JSON.stringify(data.produk));
                if (data.galon) localStorage.setItem('w_galon', JSON.stringify(data.galon));
                if (data.gas) localStorage.setItem('w_gas', JSON.stringify(data.gas));
                if (data.koin) localStorage.setItem('w_koin', JSON.stringify(data.koin));

                // Khusus Piutang
                if (data.piutang) {
                    localStorage.setItem('warungan_piutang', JSON.stringify(data.piutang));
                }

                alert("✅ Data Berhasil Dimuat! Aplikasi akan memuat ulang.");
                location.reload(); // Refresh aplikasi untuk menerapkan data baru
            }
        } catch (err) {
            alert("❌ Gagal membaca file! Pastikan file yang dipilih adalah file .json cadangan yang benar.");
        }
    };
    reader.readAsText(file);
}

// Fungsi muncul/sembunyi tombol X
function toggleClearBtn(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input && btn) {
        btn.style.display = input.value ? 'block' : 'none';
    }
}

// Hapus pencarian produk
function clearKasirSearch() {
    const input = document.getElementById('kasir-search-input');
    if (input) {
        input.value = "";
        kasirSearch = ""; // Reset variabel filter
        toggleClearBtn('kasir-search-input', 'kasir-clear-btn');
        renderKasirProduk(); // Tampilkan semua produk lagi
    }
}

// Hapus nama pembeli di keranjang
function clearCartBuyerName() {
    const input = document.getElementById('kasir-nama');
    if (input) {
        input.value = "";
        toggleClearBtn('kasir-nama', 'cart-name-clear-btn');
    }
}

//sfx
// Jalankan ini saat aplikasi pertama kali dimuat
const initialMuteBtn = document.getElementById('mute-btn');
if (initialMuteBtn) {
    initialMuteBtn.innerText = isMuted ? "🔇 Muted" : "🔊 Sound On";
    initialMuteBtn.style.background = isMuted ? "#e74c3c" : "#2ecc71";
}

//secret title hidden gem
let crashClickCount = 0;
let crashTimer;

function secretCrash() {
    crashClickCount++;

    // Reset hitungan jika dalam 2 detik tidak ada klik lagi
    clearTimeout(crashTimer);
    crashTimer = setTimeout(() => {
        crashClickCount = 0;
    }, 2000);

    // Jika sudah mencapai 5 klik
    if (crashClickCount === 5) {
        playSound('error.mp3'); // Bunyi dulu

        // Kasih efek layar merah dikit sebelum pindah (drama)
        document.body.style.transition = "0.3s";
        document.body.style.background = "red";

        setTimeout(() => {
            window.location.href = '404.html';
        }, 500);

        crashClickCount = 0;
    }
}

//mobile friendly sidebar
// Fungsi Buka Tutup Sidebar Mobile
// Fungsi Buka Tutup Sidebar Mobile
function toggleSidebar(event) {
    if (event) event.stopPropagation();

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        console.log("Sidebar toggled!"); // Check your browser console for this!
    } else {
        console.error("Could not find element with class '.sidebar'");
    }
}

document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.getElementById('menu-mobile');

    // Only run the 'close' logic if the sidebar actually exists and is active
    if (sidebar && sidebar.classList.contains('active')) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnButton = menuBtn && menuBtn.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnButton) {
            sidebar.classList.remove('active');
        }
    }
});
//the rest
//cloud

async function simpanKeCloud() {
    const dataWarungan = {
        daftarProduk,
        saldoUtama,
        daftarTransaksi,
        daftarPiutang,
        galonData,
        gasData,
        koinData,
        logKasMutasi
    };

    try {
        await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataWarungan)
        });
        console.log("☁️ Berhasil Sinkron!");
    } catch (err) {
        console.error("☁️ Gagal Sinkron:", err);
    }
}

window.addEventListener('load', async () => {
    try {
        const res = await fetch('/api/data');
        const dataAwan = await res.json();
        
        if (dataAwan && dataAwan.daftarProduk) {
            daftarProduk = dataAwan.daftarProduk;
            saldoUtama = dataAwan.saldoUtama;
            daftarTransaksi = dataAwan.daftarTransaksi;
            daftarPiutang = dataAwan.daftarPiutang;
            galonData = dataAwan.galonData;
            gasData = dataAwan.gasData;
            koinData = dataAwan.koinData;
            logKasMutasi = dataAwan.logKasMutasi;

            saveAllData(); // Save to local storage
            renderProduk();    // Refresh the screen
            console.log("✅ Data Cloud Dimuat!");
        }
    } catch (e) {
        console.log("⚠️ Pakai data lokal (Offline).");
    }
});









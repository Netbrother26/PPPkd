// Inisialisasi jsPDF dari UMD
const { jsPDF } = window.jspdf;

window.initTrxPemesananPage = function () {
  console.log("🔥 initTrxPemesananPage dipanggil");
  setTimeout(initFormPemesanan, 200);

  fetch(sheetTrxPemesananURL)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#TabelPemesanan tbody");
      if (!tbody) return;
      tbody.innerHTML = "";

      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.No || ""}</td>
          <td>${row.No_CL || ""}</td>
          <td>${row.No_Pemesanan || ""}</td>
          <td>${row.Nama || ""}</td>
          <td>${row.Klasifikasi || ""}</td>
          <td>${row.BlokNomor || ""}</td>
          <td>${row.Type || ""}</td>
          <td>${row.Ukuran || ""}</td>
          <td>${row.Harga ? formatRupiah(row.Harga) : ""}</td>
          <td>${getStatusBadge(row.Status)}</td>
          <td>${tanggalSaja(row.Tanggal)}</td>
          <td>
            <button class="btn btn-sm btn-warning printBtn" data-index="${index}"><i class="fa fa-print"></i> Print</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if ($.fn.DataTable.isDataTable('#TabelPemesanan')) {
        $('#TabelPemesanan').DataTable().clear().destroy();
      }

      $('#TabelPemesanan').DataTable({
        pageLength: 10,
        dom: 'Bflrtip',
        buttons: ['excelHtml5'],
        language: {
          search: "Cari:",
          lengthMenu: "Tampilkan _MENU_ data",
          info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
          zeroRecords: "Tidak ada data ditemukan",
          infoEmpty: "Menampilkan 0 sampai 0 dari 0 data"
        }
      });

      // Tambahkan event listener untuk print
      document.querySelectorAll(".printBtn").forEach(button => {
        button.addEventListener("click", () => {
          const row = data[button.dataset.index];
          printPDF(row);
        });
      });
    })
    .catch(err => console.error('Gagal memuat data:', err));
};

function printPDF(row) {
  if (!window.jspdf || typeof window.jspdf.jsPDF === 'undefined') {
    alert("jsPDF belum dimuat. Pastikan library jsPDF sudah ditambahkan.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logoUrl = "https://i.imgur.com/C4UJE1Iaaaaa.png"; // logo imgur bebas CORS
  const logo = new Image();
  logo.crossOrigin = "Anonymous";
  logo.src = logoUrl;

  logo.onload = function () {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);

    doc.setFontSize(16);
    doc.text("FORMULIR PEMESANAN LAPAK", 105, 20, { align: "center" });
    doc.setFontSize(12);

    const entries = [
      ["No CL", row.No_CL],
      ["No Pemesanan", row.No_Pemesanan],
      ["Nama", row.Nama],
      ["Klasifikasi", row.Klasifikasi],
      ["Blok Nomor", row.BlokNomor],
      ["Type", row.Type],
      ["Ukuran", row.Ukuran],
      ["Harga", formatRupiah(row.Harga)],
      ["Status", row.Status],
      ["Tanggal", tanggalSaja(row.Tanggal)],
      ["Input By", row.InputBy || ""]
    ];

    let y = 40;
    entries.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, y);
      doc.text(`${value || ""}`, 70, y);
      y += 10;
    });

    doc.setFontSize(12);
    doc.text("Mengetahui,", 140, y + 20);
    doc.text("________________________", 130, y + 40);
    doc.text("(Admin / Petugas)", 140, y + 50);

    doc.setFontSize(10);
    doc.text("Dicetak otomatis dari sistem Revitalisasi Pasar Kedungwungu", 105, 285, { align: "center" });
    doc.save(`Pemesanan_${row.No_Pemesanan || row.No || "data"}.pdf`);
  };

  logo.onerror = function () {
    console.warn("Logo gagal dimuat, mencetak tanpa logo.");
    generatePDFContent(doc, null, row);
  };
}

function generatePDFContent(doc, logo, row) {
  doc.setFontSize(16);
  doc.text("FORMULIR PEMESANAN LAPAK", 105, 20, { align: "center" });
  doc.setFontSize(12);

  const entries = [
    ["No CL", row.No_CL],
    ["No Pemesanan", row.No_Pemesanan],
    ["Nama", row.Nama],
    ["Klasifikasi", row.Klasifikasi],
    ["Blok Nomor", row.BlokNomor],
    ["Type", row.Type],
    ["Ukuran", row.Ukuran],
    ["Harga", formatRupiah(row.Harga)],
    ["Status", row.Status],
    ["Tanggal", tanggalSaja(row.Tanggal)],
    ["Input By", row.InputBy || ""]
  ];

  let y = 40;
  entries.forEach(([label, value]) => {
    doc.text(`${label}:`, 20, y);
    doc.text(`${value || ""}`, 70, y);
    y += 10;
  });

  doc.setFontSize(12);
  doc.text("Mengetahui,", 140, y + 20);
  doc.text("________________________", 130, y + 40);
  doc.text("(Admin / Petugas)", 140, y + 50);

  doc.setFontSize(10);
  doc.text("Dicetak otomatis dari sistem Revitalisasi Pasar Kedungwungu", 105, 285, { align: "center" });
  doc.save(`Pemesanan_${row.No_Pemesanan || row.No || "data"}.pdf`);
}


window.sheetBaseURL = window.sheetBaseURL || 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec';
window.sheetTrxPemesananURL = `${sheetBaseURL}?sheet=Trxpemesanan`;

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
}

function tanggalSaja(datetime) {
  if (!datetime) return "";
  const d = new Date(datetime);
  return d.toISOString().split('T')[0];
}

function getStatusBadge(Status) {
  const lower = Status?.toLowerCase() || "";
  if (lower === "booking") return `<span class="badge bg-primary text-white">Booking</span>`;
  if (lower === "terjual") return `<span class="badge bg-danger text-white">Terjual</span>`;
  if (lower === "cancel") return `<span class="badge bg-secondary text-white">Cancel</span>`;
  return `<span class="badge bg-success text-white">Tersedia</span>`;
}

function isiDropdownNama() {
  fetch(`${sheetBaseURL}?sheet=DataPembeli`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("Nama");
      if (!select) return;
      select.innerHTML = `<option value="">-- Pilih Nama --</option>`;
      data.forEach(row => {
        if (row.Nama) {
          const option = document.createElement("option");
          option.value = row.Nama;
          option.textContent = row.Nama;
          select.appendChild(option);
        }
      });
    });
}

function isiDropdownBlokNomor() {
  fetch(`${sheetBaseURL}?sheet=DataStok`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("BlokNomor");
      if (!select) return;
      select.innerHTML = `<option value="">-- Pilih Blok --</option>`;
      data.forEach(row => {
        if (row.Status?.toLowerCase() === 'tersedia' && row.BlokNomor) {
          const option = document.createElement("option");
          option.value = row.BlokNomor;
          option.textContent = row.BlokNomor;
          select.appendChild(option);
        }
      });

      select.addEventListener("change", function () {
        const blok = this.value;
        const stok = data.find(row => row.BlokNomor === blok);
        const type = document.getElementById("Type");
        const ukuran = document.getElementById("Ukuran");
        const harga = document.getElementById("Harga");

        if (stok) {
          if (type && stok.TypeRuko) type.value = stok.TypeRuko;
          if (ukuran) ukuran.value = stok.Ukuran || "";
          if (harga) {
            const hargaNumber = parseInt((stok.Harga || "0").toString().replace(/\D/g, ""));
            harga.value = formatRupiah(hargaNumber);
          }
        } else {
          if (type) type.value = "";
          if (ukuran) ukuran.value = "";
          if (harga) harga.value = "";
        }
      });
    });
}

window.initFormPemesanan = function () {
  const no = document.getElementById("No");
  const noCl = document.getElementById("No_CL");
  const noPemesanan = document.getElementById("No_Pemesanan");
  const inputBy = document.getElementById("InputBy");
  const tanggal = document.getElementById("Tanggal");
  const form = document.getElementById("formPemesanan");

  fetch(sheetTrxPemesananURL)
    .then(res => res.json())
    .then(data => {
      const last = data.length ? data[data.length - 1] : null;
      const lastNo = last ? parseInt(last.No || "0") + 1 : 1;
      const lastNoPemesanan = last && last.No_Pemesanan && typeof last.No_Pemesanan === 'string'
        ? parseInt(last.No_Pemesanan.match(/\d+/)?.[0] || "0") + 1
        : 1;

      if (no) no.value = String(lastNo).padStart(3, '0');
      if (noCl) noCl.value = `${String(lastNo).padStart(3, '0')}/CL-PSG/V/2025`;
      if (noPemesanan) noPemesanan.value = `00${lastNoPemesanan}/SPPU/II/2025`;

      const user = firebase.auth().currentUser;
      if (inputBy && user?.email) inputBy.value = user.email;
      if (tanggal) tanggal.value = new Date().toISOString().split('T')[0];
    });

  isiDropdownNama();
  isiDropdownBlokNomor();

  if (form.dataset.listenerAttached !== "true") {
    form.dataset.listenerAttached = "true";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = {};
      formData.forEach((val, key) => data[key] = val);
      data.Harga = data.Harga.replace(/[Rp,. ]/g, "") || "0";

      fetch(sheetBaseURL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: "save_pemesanan",
          ...data
        })
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "success") {
            alert("Pemesanan berhasil disimpan!");
            form.reset();
            setTimeout(initFormPemesanan, 200);
            initTrxPemesananPage();
          } else {
            alert("Gagal menyimpan pemesanan.");
          }
        })
        .catch(err => {
          console.error("Error:", err);
          alert("Terjadi kesalahan.");
        });
    });
  }
};

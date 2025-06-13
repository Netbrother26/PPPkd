

window.initTrxPenjualanPage = function () {
  console.log("🔥 initTrxPenjualan dipanggil");
  setTimeout(initFormPenjualan, 200);

  fetch(sheetTrxPenjualanURL)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#TabelPenjualan tbody");
      if (!tbody) return;
      tbody.innerHTML = "";

      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.TrxPenjualan || ""}</td>
            <td>${row.Tanggal || ""}</td>
            <td>${row.Nama || ""}</td>
            <td>${row.BlokNomor || ""}</td>
            <td>${row.TypeRuko || ""}</td>
            <td>${row.Harga ? formatRupiah(row.Harga) : ""}</td>
            <td>${row.Biaya_Tambahan ? formatRupiah(row.Biaya_Tambahan) : ""}</td>
            <td>${row.Discount ? formatRupiah(row.Discount) : ""}</td>
            <td>${row.Total ? formatRupiah(row.Total) : ""}</td>
        `;
        tbody.appendChild(tr);
      });

      if ($.fn.DataTable.isDataTable('#TabelPenjualan')) {
        $('#TabelPenjualan').DataTable().clear().destroy();
      }

      $('#TabelPenjualan').DataTable({
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


window.sheetBaseURL = window.sheetBaseURL || 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec';
window.sheetTrxPenjualanURL = `${sheetBaseURL}?sheet=TrxPenjualan`;

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


function isiDropdownNama() {
  fetch(`${sheetBaseURL}?sheet=TrxPemesanan`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("Nama");
      if (!select) return;
      select.innerHTML = '<option value="">-- Pilih Nama --</option>';
      data.forEach(row => {
        if (row.Status?.toLowerCase() === 'booking' && row.Nama) {
          const option = document.createElement("option");
          option.value = row.Nama;
          option.textContent = row.Nama;
          select.appendChild(option);
        }
      });

      select.addEventListener("change", function () {
        const nama = this.value;
        const stok = data.find(row => row.nama === nama);
        const TypeRuko = document.getElementById("TypeRuko");
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

window.initFormPenjualan = function () {
  const no = document.getElementById("No");
  const noCl = document.getElementById("No_CL");
  const noPenjualan = document.getElementById("No_Penjualan");
  const inputBy = document.getElementById("InputBy");
  const tanggal = document.getElementById("Tanggal");
  const form = document.getElementById("formPenjualan");

  fetch(sheetTrxPenjualanURL)
    .then(res => res.json())
    .then(data => {
      const last = data.length ? data[data.length - 1] : null;
      const lastNo = last ? parseInt(last.No || "0") + 1 : 1;
      const lastNoPenjualan = last && last.No_Penjualan && typeof last.No_Penjualan === 'string'
        ? parseInt(last.No_Penjualan.match(/\d+/)?.[0] || "0") + 1
        : 1;

      if (no) no.value = String(lastNo).padStart(3, '0');
      if (noCl) noCl.value = `${String(lastNo).padStart(3, '0')}/CL-PSG/V/2025`;
      if (noPenjualan) noPenjualan.value = `00${lastNoPenjualan}/SPPU/II/2025`;

      const user = firebase.auth().currentUser;
      if (inputBy && user?.email) inputBy.value = user.email;
      if (tanggal) tanggal.value = new Date().toISOString().split('T')[0];
    });

  isiDropdownNama();
  

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
          action: "save_Penjualan",
          ...data
        })
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "success") {
            alert("Penjualan berhasil disimpan!");
            form.reset();
            setTimeout(initFormPenjualan, 200);
            initTrxPenjualanPage();
          } else {
            alert("Gagal menyimpan Penjualan.");
          }
        })
        .catch(err => {
          console.error("Error:", err);
          alert("Terjadi kesalahan.");
        });
    });
  }
};

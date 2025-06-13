(function () {
  const sheetTrxPenjualanURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=TrxPenjualan';
  const sheetPemesananURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=TrxPemesanan';
  const sheetPostURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec';

  let dataBooking = [];

  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  }

  function hitungTotal() {
    const harga = parseInt(document.getElementById("Harga").value.replace(/\D/g, "")) || 0;
    const tambahan = parseInt(document.getElementById("Biaya_Tambahan").value.replace(/\D/g, "")) || 0;
    const diskon = parseInt(document.getElementById("Discount").value.replace(/\D/g, "")) || 0;
    document.getElementById("Total").value = harga + tambahan - diskon;
  }

  function setupEventHandlers() {
    const nama = document.getElementById("Nama");
    const harga = document.getElementById("Harga");
    const tambahan = document.getElementById("Biaya_Tambahan");
    const diskon = document.getElementById("Discount");

    [harga, tambahan, diskon].forEach(input => {
      input.addEventListener("input", hitungTotal);
    });

    nama.addEventListener("change", () => {
      const [selectedName, selectedNoCL] = nama.value.split("|");
      const item = dataBooking.find(row => row.Nama === selectedName && row.No_CL === selectedNoCL);
      if (!item) return;

      document.getElementById("BlokNomor").value = item.BlokNomor || "";
      document.getElementById("TypeRuko").value = item.Type || "";
      document.getElementById("Ukuran").value = item.Ukuran || "";
      document.getElementById("Harga").value = formatRupiah(item.Harga || 0);

      hitungTotal();
    });
  }

  window.initFormPenjualan = function () {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("Tanggal").value = today;

    fetch(sheetTrxPenjualanURL)
      .then(res => res.json())
      .then(data => {
        const last = data.length ? data[data.length - 1] : null;
        const lastNo = last ? parseInt(last.TrxPenjualan.match(/\d+$/)?.[0] || "0") + 1 : 1;
        const noTransaksi = `25/PROINV-PK/${String(lastNo).padStart(3, '0')}`;
        document.getElementById("TrxPenjualan").value = noTransaksi;
      });

    fetch(sheetPemesananURL)
      .then(res => res.json())
      .then(data => {
        dataBooking = data.filter(d => d.Status?.toLowerCase() === "booking");
        const namaSelect = document.getElementById("Nama");
        namaSelect.innerHTML = '<option value="">-- Pilih Nama --</option>';
        dataBooking.forEach(d => {
          const option = document.createElement("option");
          option.value = `${d.Nama}|${d.No_CL}`;
          option.textContent = d.Nama;
          namaSelect.appendChild(option);
        });
        setupEventHandlers();
      });
  }

  window.simpanPenjualan = function () {
    const form = document.getElementById("formPenjualan");
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => data[key] = val);
    data.Harga = (data.Harga || '').replace(/\D/g, "");
    data.Biaya_Tambahan = (data.Biaya_Tambahan || '').replace(/\D/g, "");
    data.Discount = (data.Discount || '').replace(/\D/g, "");
    data.Total = (data.Total || '').replace(/\D/g, "");

    fetch(sheetPostURL, {
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: "save_penjualan",
        ...data
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          alert("Data berhasil disimpan!");
          form.reset();
          initFormPenjualan();
          initTrxPenjualanPage();
        } else {
          alert("Gagal menyimpan data.");
        }
      })
      .catch(err => {
        console.error("Gagal:", err);
        alert("Terjadi kesalahan saat menyimpan.");
      });
  }

  window.initTrxPenjualanPage = function () {
    initFormPenjualan();

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
            <td>${formatRupiah(row.Harga) || ""}</td>
            <td>${formatRupiah(row.Biaya_Tambahan) || ""}</td>
            <td>${formatRupiah(row.Discount) || ""}</td>
            <td>${formatRupiah(row.Total) || ""}</td>
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
      });
  }

  function waitForFormAndInit() {
  if (document.getElementById("formPenjualan")) {
    initTrxPenjualanPage();
  } else {
    setTimeout(waitForFormAndInit, 100);
  }
}

waitForFormAndInit();
})();

(function () {
  const sheetDataStokURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=DataStok';
  let rowDataStok = [];

  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  }

  function getTypeIcon(KodeType) {
    const lower = KodeType?.toLowerCase() || "";
    if (lower.includes("rh 34")) return `<i class="fa fa-home text-warning"></i> ${KodeType}`;
    if (lower.includes("rr 34")) return `<i class="fa fa-home text-secondary"></i> ${KodeType}`;
    if (lower.includes("rhm 33")) return `<i class="fa fa-home text-danger"></i> ${KodeType}`;
    if (lower.includes("rr 33")) return `<i class="fa fa-home text-success"></i> ${KodeType}`;
    if (lower.includes("l 33")) return `<i class="fa fa-home text-info"></i> ${KodeType}`;
    return `<i class="fas fa-box text-muted"></i> ${KodeType}`;
  }

  function getStatusBadge(Status) {
    const lower = Status?.toLowerCase() || "";
    if (lower === "booking") return `<span class="badge badge-primary"><i class="fa fa-square-o"></i> Booking</span>`;
    if (lower === "terjual") return `<span class="badge badge-danger"><i class="fa fa-minus-square"></i> Terjual</span>`;
    return `<span class="badge badge-success"><i class="fa fa-check-square"></i> Tersedia</span>`;
  }

  window.initDataStokPage = function () {
    fetch(sheetDataStokURL)
      .then(res => res.json())
      .then(data => {
        rowDataStok = data;
        const tbody = document.querySelector("#TabelStok tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        data.forEach((row, index) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.No || ""}</td>
            <td>${getTypeIcon(row.KodeType) || ""}</td>
            <td>${row.NamaPembeli || ""}</td>
            <td>${row.TypeRuko || ""}</td>
            <td>${row.Ukuran || ""}</td>
            <td>${row.BlokNomor || ""}</td>
            <td>${row.Harga ? formatRupiah(row.Harga) : ""}</td>
            <td>${getStatusBadge(row.Status) || ""}</td>
          `;
          tbody.appendChild(tr);
        });

        $('#TabelStok').DataTable({
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
      })
      .catch(err => console.error('Gagal memuat data:', err));
  };
})();

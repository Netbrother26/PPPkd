(function () {
  const sheetStatsURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=pivot';
  const sheetTrxPenjualanURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=TrxPenjualan';

  let chartInstance = null;

  function formatRupiah(angka) {
    if (isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  }

  function formatTanggal(tanggalStr) {
    const tanggal = new Date(tanggalStr);
    if (isNaN(tanggal)) return tanggalStr;
    return tanggal.toLocaleDateString('id-ID');
  }

  function renderChart(data, mode = 'month') {
    const ctx = document.getElementById('chartPenjualan');
    if (!ctx) return;

    const grouped = {};
    data.forEach(row => {
      const date = new Date(row.Tanggal);
      if (isNaN(date)) return;

      let labelKey = '';
      if (mode === 'day') {
        labelKey = date.toLocaleDateString('id-ID');
      } else if (mode === 'month') {
        labelKey = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      }

      const total = parseFloat(row.Total || 0);
      grouped[labelKey] = (grouped[labelKey] || 0) + total;
    });

    const labels = Object.keys(grouped);
    const totals = Object.values(grouped);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Grafik Penjualan',
          data: totals,
          fill: true,
          tension: 0.4,
          backgroundColor: 'rgba(13,110,253,0.1)',
          borderColor: 'rgba(13,110,253,1)',
          borderWidth: 4,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(13,110,253,1)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatRupiah(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => formatRupiah(value)
            }
          }
        }
      }
    });
  }

  window.initDashboardPage = function () {
    loadStats();

    fetch(sheetTrxPenjualanURL)
      .then(res => res.json())
      .then(data => {
        renderChart(data, 'month');

        const filter = document.getElementById('filterChart');
        if (filter) {
          filter.addEventListener('change', () => {
            const mode = filter.value;
            renderChart(data, mode);
          });
        }
      })
      .catch(err => console.error('Gagal memuat grafik penjualan:', err));

    console.log("✅ Halaman Dashboard berhasil diinisialisasi");
  };

  async function loadStats() {
    try {
      const res = await fetch(sheetStatsURL, { cache: "no-store" });
      const data = await res.json();

      const totalPembeli = document.getElementById('total-pembeli');
      const totalBooking = document.getElementById('total-booking');
      const totalTerjual = document.getElementById('total-terjual');
      const sisaRuko = document.getElementById('sisa-ruko');
      const TPenjualan = document.getElementById('TPenjualan');

      if (!totalPembeli || !totalBooking || !totalTerjual || !sisaRuko || !TPenjualan) {
        console.warn("⚠️ Elemen statistik tidak ditemukan di halaman. Pastikan ID elemen tersedia di HTML:", {
          'total-pembeli': totalPembeli,
          'total-booking': totalBooking,
          'total-terjual': totalTerjual,
          'sisa-ruko': sisaRuko,
          'TPenjualan': TPenjualan
        });
        return;
      }

      totalPembeli.textContent = data.totalPembeli ?? 'N/A';
      totalBooking.textContent = data.totalBooking ?? 'N/A';
      totalTerjual.textContent = data.totalTerjual ?? 'N/A';
      sisaRuko.textContent = data.sisaRuko ?? 'N/A';
      TPenjualan.textContent = data.TPenjualan ? formatRupiah(data.TPenjualan) : 'Rp 0';
    } catch (error) {
      console.error("Gagal mengambil data statistik:", error);
    }
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  // Tambahkan gaya CSS langsung
  const style = document.createElement("style");
  style.textContent = `
    .navbar-nav .nav-link.active,
    .navbar-nav .nav-item a.active,
    .nav a.active,
    .nav-link.active,
    .nav-item a.active {
      background-color: #007bff !important;
      color: #fff !important;
      border-radius: 4px;
    }
    .menu-icon.active {
      color: #007bff;
    }
  `;
  document.head.appendChild(style);

  function loadComponent(file, targetId) {
    fetch(file)
      .then(res => res.text())
      .then(html => {
        const target = document.getElementById(targetId);
        if (target) target.innerHTML = html;
      });
  }

  function showLoading() {
    const main = document.getElementById("main-content");
    if (main) {
      main.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Memuat...</p></div>';
    }
  }

  window.loadPage = function (file, callback) {
    showLoading();
    fetch(file)
      .then(res => res.text())
      .then(html => {
        const target = document.getElementById("main-content");
        if (target) {
          target.innerHTML = html;
        } else {
          console.error("❌ Target #main-content tidak ditemukan.");
        }
        if (typeof callback === "function") callback();
      })
      .catch(err => console.error("Gagal load page:", err));
  };

  window.logout = function () {
    alert("Logout berhasil!");
    window.location.href = "index.html";
  };

  function clearActiveMenus() {
    document.querySelectorAll(".nav-link, .menu-icon, .nav-item a").forEach(el => {
      el.classList.remove("active");
    });
  }

  function bindMenuClick(menuId, pageUrl, scriptPath = null, initFunctionName = null, extraInitFunction = null) {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.addEventListener("click", function (e) {
        e.preventDefault();

        clearActiveMenus();
        menu.classList.add("active");

        loadPage(pageUrl, function () {
          if (scriptPath) {
            const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
            if (existingScript) {
              existingScript.remove();
            }

            const script = document.createElement("script");
            script.src = scriptPath;
            script.onload = () => {
              if (initFunctionName && typeof window[initFunctionName] === "function") {
                if (initFunctionName === 'initTrxPemesananPage') {
                  const oldInit = window.initTrxPemesananPage;
                  window.initTrxPemesananPage = function () {
                    const tableId = '#TabelPemesanan';
                    if ($.fn.DataTable.isDataTable(tableId)) {
                      $(tableId).DataTable().clear().destroy();
                    }
                    oldInit();
                  };
                }
                window[initFunctionName]();
              }
              if (extraInitFunction && typeof window[extraInitFunction] === "function") {
                window[extraInitFunction]();
              }
            };
            document.body.appendChild(script);
          } else {
            if (extraInitFunction && typeof window[extraInitFunction] === "function") {
              window[extraInitFunction]();
            }
          }
        });
      });
    }
  }

  bindMenuClick("Home", "pages/home.html", "js/dashboard.js", "initDashboardPage");
  bindMenuClick("StokRuko", "pages/DataStok.html", "js/datastok.js", "initDataStokPage");
  bindMenuClick("StokStatus", "pages/StokStatus.html");

  bindMenuClick("TrxPemesanan", "pages/TrxPemesanan.html", "js/TrxPemesanan.js", "initTrxPemesananPage", "initFormPemesanan");
  bindMenuClick("TrxPenjualan", "pages/TrxPenjualan.html", "js/TrxPenjualan.js", "initTrxPenjualanPage", "initFormPenjualan");
  bindMenuClick("TrxPembelian", "pages/TrxPembelian.html", "js/TrxPembelian.js", "initTrxPembelianPage");
  bindMenuClick("TrxKas", "pages/TrxKas.html", "js/TrxKas.js", "initTrxKasPage");
  bindMenuClick("TrxJurnal", "pages/TrxJurnal.html", "js/TrxJurnal.js", "initTrxJurnalPage");
  bindMenuClick("TrxGaji", "pages/TrxGaji.html", "js/TrxGaji.js", "initTrxGajiPage");

  bindMenuClick("menu-pembeli", "pages/DataPembeli.html", "js/datapembeli.js", "initPembeliPage");
  bindMenuClick("LprPenjualan", "pages/LprPenjualan.html", "js/LprPenjualan.js", "initLprPenjualanPage");
  bindMenuClick("LprInvoice", "pages/LprInvoice.html", "js/LprInvoice.js", "initLprInvoicePage");
  bindMenuClick("LprPO", "pages/LprPO.html", "js/LprPO.js", "initLprPOPage");
  bindMenuClick("LprPembelian", "pages/LprPembelian.html", "js/LprPembelian.js", "initLprPembelianPage");
  bindMenuClick("LprAsset", "pages/LprAsset.html", "js/LprAsset.js", "initLprAssetPage");
  bindMenuClick("LprHutang", "pages/LprHutang.html", "js/LprHutang.js", "initLprHutangPage");

  bindMenuClick("LprNS", "pages/LprNS.html", "js/LprNS.js", "initLprNSPage");
  bindMenuClick("LprArusKas", "pages/LprArusKas.html", "js/LprArusKas.js", "initLprArusKasPage");
  bindMenuClick("LprNeraca", "pages/LprNeraca.html", "js/LprNeraca.js", "initLprNeracaPage");
  bindMenuClick("LprLR", "pages/LprLR.html", "js/LprLR.js", "initLprLRPage");

  bindMenuClick("User", "pages/User.html", "js/User.js", "initUserPage");
  bindMenuClick("MstrRuko", "pages/MstrRuko.html", "js/MstrRuko.js", "initMstrRukoPage");
  bindMenuClick("Pengaturan", "pages/Pengaturan.html", "js/Pengaturan.js", "initPengaturanPage");

  loadPage("pages/home.html", function () {
    const script = document.createElement("script");
    script.src = "js/dashboard.js";
    script.onload = () => {
      if (typeof window.initDashboardPage === "function") {
        window.initDashboardPage();
      }
    };
    document.body.appendChild(script);
    const menu = document.getElementById("Home");
    if (menu) menu.classList.add("active");
  });
});

(function () {
  const sheetPembeliURL = 'https://script.google.com/macros/s/AKfycbz2ztfm0TAOAOSy0yJqSmalvSeRIi80UocnMm7j84mIjFS80xEyJnzoHgqT6F_FM8H5eQ/exec?sheet=DataPembeli';
  let rowData = [];
  let deleteIndex = -1;

  window.initPembeliPage = function () {
    const tbody = document.querySelector("#dataTable tbody");
    if (!tbody) return;

    fetch(sheetPembeliURL)
      .then(res => res.json())
      .then(data => {
        rowData = data;
        tbody.innerHTML = "";

        data.forEach((row, index) => {
          const tr = document.createElement("tr");
          tr.dataset.index = index;
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.ID_Pembeli || ""}</td>
            <td>${row.Nama || ""}</td>
            <td>${row.Jenis_Kelamin || ""}</td>
            <td>${row.Nomor_Identitas || ""}</td>
            <td>${row.Alamat || ""}</td>
            <td>${row.Desa || ""}</td>
            <td>${row.Kecamatan || ""}</td>
            <td>${row.Kabupaten || ""}</td>
            <td>${row.No_HP || ""}</td>
            <td>${row.Kontak_Darurat || ""}</td>
            <td>${row.Email || ""}</td>
            <td>
              <button class="btn btn-sm btn-primary editBtn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
              <button class="btn btn-sm btn-danger deleteBtn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#deleteModal">Hapus</button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        $('#dataTable').DataTable({
          destroy: true,
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
      .catch(err => console.error("Gagal mengambil data pembeli:", err));

    // Generate form input
    fetch(sheetPembeliURL)
      .then(res => res.json())
      .then(data => {
        const thirdRow = data[2] || {};
        const keys = Object.keys(thirdRow).filter(key => !['No', 'ID_Pembeli', 'TimeStamp'].includes(key));

        const addFields = document.getElementById("addFields");
        if (!addFields) return;

        addFields.innerHTML = "";
        keys.forEach(key => {
          let inputElement = '';
          const username = localStorage.getItem("username") || "UNKNOWN";

          switch (key) {
            case 'Email':
              inputElement = `<input type="email" name="${key}" class="form-control" placeholder="contoh@email.com" required />`; break;
            case 'No_HP':
            case 'Kontak_Darurat':
              inputElement = `<input type="tel" name="${key}" class="form-control" placeholder="+628123456789" required />`; break;
            case 'Nomor_Identitas':
              inputElement = `<input type="number" name="${key}" class="form-control" placeholder="16 digit KTP/NIK" required />`; break;
            case 'Alamat':
              inputElement = `<textarea name="${key}" class="form-control" placeholder="Blok/Dusun, RT, RW" rows="3" required></textarea>`; break;
            case 'InputBy':
              inputElement = `<input type="text" name="${key}" class="form-control" value="${username}" readonly />`; break;
            case 'Dokumen':
              inputElement = `<input type="file" name="${key}" class="form-control-file" />`; break;
            case 'Jenis_Kelamin':
              inputElement = `<select name="${key}" class="form-control" required>
                <option value="">-- Pilih --</option>
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>`; break;
            case 'Kecamatan':
              inputElement = `<select name="${key}" class="form-control" required>
                <option value="">-- Pilih --</option>
                <option value="Anjatan">Anjatan</option>
                <option value="Haurgelis">Haurgelis</option>
                <option value="Patrol">Patrol</option>
              </select>`; break;
            case 'Kabupaten':
              inputElement = `<select name="${key}" class="form-control" required>
                <option value="">-- Pilih --</option>
                <option value="Indramayu">Indramayu</option>
                <option value="Subang">Subang</option>
              </select>`; break;
            default:
              inputElement = `<input type="text" name="${key}" class="form-control" required />`;
          }

          addFields.innerHTML += `
            <div class="form-group col-12 col-md-6">
              <label>${key}</label>
              ${inputElement}
            </div>
          `;
        });
      });
  };

  // Submit tambah data
  $(document).on('submit', '#addForm', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    let valid = true;
    let errorMessage = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+62|08)[0-9]{9,13}$/;

    for (let [name, value] of formData.entries()) {
      if (name === 'Dokumen') continue;

      if (!value.trim()) {
        valid = false;
        errorMessage = `Kolom "${name}" wajib diisi.`;
        break;
      }

      if (name === 'Email' && !emailRegex.test(value)) {
        valid = false;
        errorMessage = `Format email tidak valid.`;
        break;
      }

      if ((name === 'No_HP' || name === 'Kontak_Darurat') && !phoneRegex.test(value)) {
        valid = false;
        errorMessage = `Nomor HP "${name}" tidak valid (Gunakan +62 atau 08).`;
        break;
      }

      if (name === 'Nomor_Identitas' && !/^[0-9]{12,20}$/.test(value)) {
        valid = false;
        errorMessage = `Nomor Identitas harus berupa angka 12–20 digit.`;
        break;
      }
    }

    if (!valid) {
      alert(errorMessage);
      return;
    }

    formData.append("No", (rowData.length + 1).toString());
    formData.append("ID_Pembeli", "P" + String(rowData.length + 1).padStart(3, '0'));
    formData.append("action", "upload");

    const fileInput = document.querySelector('input[name="Dokumen"]');
    const file = fileInput?.files[0];

    if (!file) {
      alert("❌ Dokumen belum diunggah.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
      const base64File = reader.result.split(',')[1];

      const data = new URLSearchParams();

      formData.forEach((value, key) => {
        if (key !== 'Dokumen') {
          data.append(key, value);
        }
      });

      data.append("filename", file.name);
      data.append("file", base64File);

      fetch(sheetPembeliURL, {
        method: "POST",
        body: data
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === 'success') {
            alert('✅ Data berhasil ditambahkan');
            location.reload();
          } else {
            alert('❌ Gagal menambahkan data: ' + res.message);
          }
        })
        .catch(err => {
          console.error("❌ Gagal kirim:", err);
          alert("❌ Gagal mengirim data");
        });
    };

    reader.readAsDataURL(file);
  });

  // Edit handler
  $(document).on('click', '.editBtn', function () {
    const index = $(this).data('index');
    const data = rowData[index];
    const editFields = $('#editFields');
    editFields.html('');
    Object.keys(data).forEach(key => {
      editFields.append(`
        <div class="form-group">
          <label>${key}</label>
          <input name="${key}" class="form-control" value="${data[key]}">
        </div>
      `);
    });
    $('#editForm').data('rowIndex', index);
  });

  $('#editForm').on('submit', function (e) {
    e.preventDefault();
    const index = $(this).data('rowIndex');
    const formData = {};
    $(this).serializeArray().forEach(item => formData[item.name] = item.value);

    fetch(`${sheetPembeliURL}&index=${index}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        alert('Data berhasil diupdate');
        location.reload();
      });
  });

  $(document).on('click', '.deleteBtn', function () {
    deleteIndex = $(this).data('index');
  });

  $('#confirmDelete').on('click', function () {
    fetch(`${sheetPembeliURL}&index=${deleteIndex}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        alert('Data berhasil dihapus');
        location.reload();
      });
  });
})();

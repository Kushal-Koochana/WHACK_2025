document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/contractconsultant';
        });
    }

    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const uploadBtn = document.getElementById('uploadBtn');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const loadingScreen = document.getElementById('loadingScreen');

        let selectedFile = null;

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            handleFile(e.target.files[0]);
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFile(e.dataTransfer.files[0]);
        });

        function handleFile(file) {
            if (file) {
                selectedFile = file;
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                fileInfo.classList.add('active');
                uploadBtn.disabled = false;
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        uploadBtn.addEventListener('click', () => {
            if (selectedFile) {
                loadingScreen.classList.add('active');
            }
        });

        function removeFile() {
            selectedFile = null;
            fileInput.value = '';
            fileName.textContent = '';
            fileSize.textContent = '';
            fileInfo.classList.remove('active');
            uploadBtn.disabled = true;
        }

        removeFileBtn.addEventListener('click', removeFile);
    }
});
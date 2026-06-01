// API Configuration
const API_URL = 'https://sqlite-rest-proxy.vercel.app/api';

// State Management
const state = {
    currentTable: null,
    currentPage: 0,
    recordsPerPage: 10,
    records: [],
    selectedRecord: null,
    isEditing: false,
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkApiStatus();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('loadBtn').addEventListener('click', loadRecords);
    document.getElementById('recordForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    document.getElementById('tableName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadRecords();
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('editBtn').addEventListener('click', editSelectedRecord);
    document.getElementById('deleteBtn').addEventListener('click', deleteSelectedRecord);

    // Pagination
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (state.currentPage > 0) {
            state.currentPage--;
            loadRecords();
        }
    });
    document.getElementById('nextBtn').addEventListener('click', () => {
        state.currentPage++;
        loadRecords();
    });
}

// Check API Status
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_URL}`);
        if (response.ok) {
            updateStatus('connected', 'API connected');
        } else {
            updateStatus('error', 'API error: ' + response.status);
        }
    } catch (error) {
        updateStatus('error', 'Cannot connect to API: ' + error.message);
    }
}

function updateStatus(status, message) {
    const badge = document.getElementById('apiStatus');
    badge.className = 'status-badge ' + status;
    badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    document.getElementById('statusText').textContent = message;
}

// Load Records
async function loadRecords() {
    const tableName = document.getElementById('tableName').value.trim();

    if (!tableName) {
        showToast('Please enter a table name', 'error');
        return;
    }

    state.currentTable = tableName;
    state.currentPage = 0;

    try {
        const offset = state.currentPage * state.recordsPerPage;
        const url = `${API_URL}/${tableName}?limit=${state.recordsPerPage}&offset=${offset}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        state.records = result.data || [];

        displayRecords();
        showFormSection();
        showToast(`Loaded ${state.records.length} records`, 'success');
    } catch (error) {
        showToast('Error loading records: ' + error.message, 'error');
        console.error(error);
    }
}

// Display Records
function displayRecords() {
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';

    if (state.records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No records found</td></tr>';
        document.getElementById('recordCount').textContent = '0 records';
        document.getElementById('paginationDiv').style.display = 'none';
        return;
    }

    state.records.forEach(record => {
        const tr = document.createElement('tr');
        const recordId = record.id || 'N/A';
        const dataStr = JSON.stringify(record).substring(0, 100);

        tr.innerHTML = `
            <td><strong>${recordId}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${dataStr}...</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary action-btn" onclick="viewRecord(${recordId})">View</button>
                    <button class="btn btn-danger action-btn" onclick="deleteRecord(${recordId})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('recordCount').textContent = `${state.records.length} records`;
    updatePaginationUI();
}

// Update Pagination UI
function updatePaginationUI() {
    const hasMore = state.records.length === state.recordsPerPage;
    document.getElementById('paginationDiv').style.display = 'flex';
    document.getElementById('pageInfo').textContent = `Page ${state.currentPage + 1}`;
    document.getElementById('nextBtn').disabled = !hasMore;
}

// View Record
function viewRecord(id) {
    const record = state.records.find(r => r.id === id);
    if (!record) return;

    state.selectedRecord = record;
    const modalBody = document.getElementById('modalBody');
    
    let html = '';
    for (const [key, value] of Object.entries(record)) {
        html += `
            <div class="detail-item">
                <div class="detail-label">${key}</div>
                <div class="detail-value">${JSON.stringify(value)}</div>
            </div>
        `;
    }

    modalBody.innerHTML = html;
    document.getElementById('modalTitle').textContent = `Record #${id}`;
    document.getElementById('recordModal').style.display = 'flex';
}

// Edit Record
function editSelectedRecord() {
    if (!state.selectedRecord) return;

    state.isEditing = true;
    closeModal();
    populateForm(state.selectedRecord);
    document.getElementById('formTitle').textContent = `Edit Record #${state.selectedRecord.id}`;
    document.getElementById('submitBtn').textContent = 'Update Record';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

// Delete Record
async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
        const response = await fetch(`${API_URL}/${state.currentTable}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        showToast('Record deleted successfully', 'success');
        loadRecords();
    } catch (error) {
        showToast('Error deleting record: ' + error.message, 'error');
    }
}

// Delete Selected Record
async function deleteSelectedRecord() {
    if (!state.selectedRecord) return;
    closeModal();
    await deleteRecord(state.selectedRecord.id);
}

// Show Form Section
function showFormSection() {
    document.getElementById('recordsSection').style.display = 'block';
    document.getElementById('formSection').style.display = 'block';
    
    if (state.records.length > 0) {
        buildFormFromRecord(state.records[0]);
    }
}

// Build Form from First Record
function buildFormFromRecord(record) {
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    for (const key of Object.keys(record)) {
        if (key === 'id') continue; // Skip ID field for new records

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="field_${key}">${key}</label>
            <input type="text" id="field_${key}" name="${key}" placeholder="Enter ${key}">
        `;
        formFields.appendChild(formGroup);
    }
}

// Populate Form for Editing
function populateForm(record) {
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    for (const [key, value] of Object.entries(record)) {
        if (key === 'id') continue;

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        formGroup.innerHTML = `
            <label for="field_${key}">${key}</label>
            <input type="text" id="field_${key}" name="${key}" value="${value}">
        `;
        formFields.appendChild(formGroup);
    }
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!state.currentTable) {
        showToast('Please load a table first', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('recordForm'));
    const data = Object.fromEntries(formData);

    try {
        let response;
        let url = `${API_URL}/${state.currentTable}`;
        let method = 'POST';

        if (state.isEditing && state.selectedRecord) {
            url += `/${state.selectedRecord.id}`;
            method = 'PUT';
        }

        response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        showToast(
            state.isEditing ? 'Record updated successfully' : 'Record created successfully',
            'success'
        );

        resetForm();
        loadRecords();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// Reset Form
function resetForm() {
    document.getElementById('recordForm').reset();
    state.isEditing = false;
    state.selectedRecord = null;
    document.getElementById('formTitle').textContent = 'Add New Record';
    document.getElementById('submitBtn').textContent = 'Add Record';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Modal Functions
function closeModal() {
    document.getElementById('recordModal').style.display = 'none';
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('recordModal');
    if (e.target === modal) {
        closeModal();
    }
});

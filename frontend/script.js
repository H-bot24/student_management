const API_URL = 'studentmanagement-production-d58c.up.railway.app';

// DOM Elements
const form = document.getElementById('student-form');
const tableBody = document.getElementById('students-table-body');
const loadingIndicator = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');

const nameInput = document.getElementById('name');
const courseInput = document.getElementById('course');
const marksInput = document.getElementById('marks');

// Search for a single student
async function searchStudent() {
    const searchId = document.getElementById('search-id').value;
    const resultBox = document.getElementById('search-result');
    
    if (!searchId) {
        alert('Please enter an ID to search.');
        return;
    }

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-emerald-500 mr-2"></i> Searching...';

    try {
        const response = await fetch(`${API_URL}/${searchId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        const students = result.data || [];

        if (students.length === 0) {
            resultBox.innerHTML = '<span class="text-red-500"><i class="fa-solid fa-circle-exclamation mr-1"></i> Student not found.</span>';
        } else {
            const student = students[0];
            resultBox.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-semibold text-gray-500">Name:</span> 
                        <span class="font-bold text-gray-900">${student.name}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-semibold text-gray-500">Course:</span> 
                        <span class="text-gray-800">${student.course}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-gray-500">Marks:</span> 
                        <span class="font-bold text-sky-600">${student.marks}</span>
                    </div>
                    <div class="pt-3 flex space-x-2">
                        <button onclick="editStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}', '${student.course.replace(/'/g, "\\'")}', ${student.marks})" class="flex-1 bg-sky-100 text-sky-700 py-1.5 rounded-md hover:bg-sky-200 transition text-center font-medium">
                            <i class="fa-solid fa-pen-to-square mr-1"></i> Edit
                        </button>
                        <button onclick="document.getElementById('search-result').classList.add('hidden'); document.getElementById('search-id').value='';" class="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-md hover:bg-gray-300 transition text-center font-medium">
                            Close
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error searching student:', error);
        resultBox.innerHTML = '<span class="text-red-500"><i class="fa-solid fa-circle-exclamation mr-1"></i> Error searching for student.</span>';
    }
}

// Fetch and display all students
async function fetchStudents() {
    loadingIndicator.classList.remove('hidden');
    tableBody.innerHTML = '';
    emptyState.classList.add('hidden');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        const students = result.data || [];

        if (students.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            students.forEach(student => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-sky-50 transition-colors duration-150';
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${student.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${student.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span class="bg-sky-100 text-sky-700 py-1 px-2 rounded-md text-xs font-medium">${student.course}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span class="font-bold">${student.marks}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="editStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}', '${student.course.replace(/'/g, "\\'")}', ${student.marks})" class="text-sky-600 hover:text-sky-800 mr-2 px-2 py-1.5 rounded hover:bg-sky-100 transition inline-flex items-center">
                            <i class="fa-solid fa-pen-to-square mr-1.5"></i> Edit
                        </button>
                        <button onclick="deleteStudent(${student.id})" class="text-red-500 hover:text-red-700 px-2 py-1.5 rounded hover:bg-red-50 transition inline-flex items-center">
                            <i class="fa-solid fa-trash mr-1.5"></i> Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Failed to load students. Is the backend running?');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Handle Form Submit (Add ONLY)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value;
    const course = courseInput.value;
    const marks = marksInput.value;

    try {
        const url = `${API_URL}?name=${encodeURIComponent(name)}&course=${encodeURIComponent(course)}&marks=${encodeURIComponent(marks)}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to add student');

        form.reset();
        fetchStudents();
        
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Failed to add student.');
    }
});

// Open Edit Modal
function editStudent(id, name, course, marks) {
    document.getElementById('edit-student-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-course').value = course;
    document.getElementById('edit-marks').value = marks;
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Handle Edit Form Submit
document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-student-id').value;
    const name = document.getElementById('edit-name').value;
    const course = document.getElementById('edit-course').value;
    const marks = document.getElementById('edit-marks').value;

    try {
        const url = `${API_URL}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&course=${encodeURIComponent(course)}&marks=${encodeURIComponent(marks)}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to update student');

        closeEditModal();
        fetchStudents();
        document.getElementById('search-result').classList.add('hidden');
        
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student.');
    }
});

// Delete Student
async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete student with ID ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to delete student');

        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student.');
    }
}

// Initial fetch
fetchStudents();

$(document).ready(function () {
    // Function to fetch and render items
    function fetchItems(searchTerm = '') {
        $.get('/items', { search: searchTerm }, function (data) {
            const itemList = $('#itemList');
            itemList.empty();

            // Check if the data is an array
            if (Array.isArray(data)) {
                data.forEach(function (item) {
                    const itemRow = `
                        <tr>
                            <td>${item.name}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-btn" data-id="${item.id}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                    itemList.append(itemRow);
                });
            } else {
                console.error('Expected an array but got:', typeof data);
            }

            // Hide edit and delete buttons for normal users
            if (window.location.pathname === '/user.html') {
                $('.edit-btn').hide();
                $('.delete-btn').hide();
            }
        });
    }

    // Initial fetch of all items
    fetchItems();

    // Handle search form submission
    $('#searchForm').submit(function (e) {
        e.preventDefault();
        const searchTerm = $('#searchInput').val().trim();
        fetchItems(searchTerm);
    });

    // Clear search results
    $('#clearSearch').click(function (e) {
        e.preventDefault();
        $('#searchInput').val('');
        fetchItems();
    });

    // Add item functionality
    $('#itemForm').submit(function (e) {
        e.preventDefault();
        const itemName = $('#itemInput').val().trim();
        if (itemName) {
            $.post('/items', { name: itemName }, function () {
                $('#itemInput').val('');
                fetchItems();
            });
        }
    });

    // Edit item functionality
    $(document).on('click', '.edit-btn', function () {
        const itemId = $(this).data('id');
        const newName = prompt('Edit item name:');
        if (newName) {
            $.ajax({
                url: '/items/' + itemId,
                type: 'PUT',
                data: { name: newName },
                success: function () {
                    fetchItems();
                }
            });
        }
    });

    // Delete item functionality
    $(document).on('click', '.delete-btn', function () {
        const itemId = $(this).data('id');
        $.ajax({
            url: '/items/' + itemId,
            type: 'DELETE',
            success: function () {
                fetchItems();
            }
        });
    });

    // Logout functionality
    $('#logoutBtn').click(function (e) {
        e.preventDefault();
        window.location.href = '/logout';
    });
});

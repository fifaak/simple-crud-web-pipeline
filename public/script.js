$(document).ready(function () {
    // Function to fetch and render items
    function fetchItems(searchTerm = '') {
        $.get('/items', { search: searchTerm }, function (data) {
            const itemList = $('#itemList');
            itemList.empty();
            data.forEach(function (item) {
                itemList.append(`
                    <tr>
                        <td>${item.name}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" data-id="${item.id}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Delete</button>
                        </td>
                    </tr>
                `);
            });
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
});

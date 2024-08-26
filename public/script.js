$(document).ready(function () {
    // Fetch and render items from the server
    function fetchItems() {
        $.get('/items', function (data) {
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

    fetchItems();

    // Add item
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

    // Edit item
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

    // Delete item
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

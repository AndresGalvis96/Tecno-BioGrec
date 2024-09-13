
function eliminarProducto(productId) {
    fetch(`http://localhost:3200/producto/${productId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo eliminar el producto');
        }
        return response.json();
    })
    .then(data => {
        alert('Producto eliminado exitosamente');
    })
    .catch(error => {
        console.error('Error al eliminar el producto:', error);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const loginTitle = document.getElementById('login-title');
    const secretKeyContainer = document.getElementById('secret-key-container');
    let clickCount = 0;

    loginTitle.addEventListener('click', function() {
        clickCount++;

        if (clickCount === 3) {
            secretKeyContainer.style.display = 'block';
            document.getElementById('secret-key').placeholder = 'Contraseña secreta';
        }
    });
});

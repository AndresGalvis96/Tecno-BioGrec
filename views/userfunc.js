document.getElementById("contenedores-link").addEventListener('click', function(event){
    containerManagment();
});
function containerManagment(){
    const content = document.getElementById("content-area");
    content.innerHTML='';

    content.innerHTML=`
    <form id="new-container-form">
    <label for="nombre">Nombre del Contenedor:</label>
    <input type="text" id="nombre" name="nombre" required><br>
  
    <label for="type">Tipo:</label>
    <select id="type" name="type" required>
      <option value="venta">Venta</option>
      <option value="alquiler">Alquiler</option>
    </select><br>
  
    <label for="size">Tamaño:</label>
    <input type="text" id="size" name="size" required><br>
  
    <label for="price">Precio:</label>
    <input type="number" id="price" name="price" required><br>
  
    <label for="availability">Disponibilidad:</label>
    <input type="checkbox" id="availability" name="availability"><br>
  
    <label for="location">Ubicación:</label>
    <input type="text" id="location" name="location" required><br>
  
    <label for="description">Descripción:</label>
    <textarea id="description" name="description"></textarea><br>
  
    <label for="image-link">Enlace de la imagen:</label>
    <input type="url" id="image-link" name="image"><br>
  
    <button type="submit">Crear Contenedor</button>
  </form>
    `
    document.getElementById('new-container-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = {
            nombre: document.getElementById('nombre').value,
            type: document.getElementById('type').value,
            size: document.getElementById('size').value,
            price: document.getElementById('price').value,
            availability: document.getElementById('availability').checked,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            image: document.getElementById('image-link').value
        };

        try {
            const response = await fetch('/user/containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                alert('Contenedor creado exitosamente');
            } else {
                alert('Error al crear el contenedor: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al intentar crear el contenedor');
        }
    });
}
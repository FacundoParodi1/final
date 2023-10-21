var botonReproducir = document.getElementById('registro-btn');
botonReproducir.addEventListener('click', function() {
  var videoURL = 'https://youtu.be/uT9SRMc69vM?si=R1nXS7vvuPM_NXew';

  var nuevaVentana = window.open(videoURL, '_blank');
  if (nuevaVentana) {
    nuevaVentana.focus(); 
  } else {
    alert('Tu navegador bloqueó la apertura de una nueva ventana. Asegúrate de permitir ventanas emergentes.');
  }
});




class Producto{
    constructor(id, nombre, precio, categoria, imagen, dato){
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
        this.dato = dato;
    }
}

class BaseDeDatos{
    constructor(){
        this.productos = [];
        this.cargarRegistros();
    }

    async cargarRegistros() {
        const resultado = await fetch("./productos.json");
        this.productos = await resultado.json();
        cargaProductos(this.productos);
      }

    traerRegistros(){
        return this.productos;
    }

    registroPorId(id){
        return this.productos.find((producto)=> producto.id === id);
    }

    registrosPorNombre(palabra){
        return this.productos.filter((producto)=> producto.nombre.toLowerCase().includes(palabra.toLowerCase()));
    }

    registrosPorCategoria(categoria) {
        return this.productos.filter((producto) => producto.categoria == categoria);
    }
}



class Carrito{
    constructor(){
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        this.carrito = carritoStorage || [];
        this.total = 0;
        this.cantidadProductos = 0;
        this.listar();
    }

    estaEnCarrito({id}){
        return this.carrito.find((producto)=> producto.id === id);
    }

    agregar(producto){
        const productoEnCarrito = this.estaEnCarrito(producto);
        if(!productoEnCarrito){
            this.carrito.push({...producto, cantidad:1})
        }else{
            productoEnCarrito.cantidad++;
        }

        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }

    quitar(id){
        const indice = this.carrito.findIndex((producto)=> producto.id === id);
        if(this.carrito[indice].cantidad > 1){
            this.carrito[indice].cantidad--;
        }else{
            this.carrito.splice(indice, 1);
        }
        this.listar();
        
    }

    vaciar() {
        this.total = 0;
        this.cantidadProductos = 0;
        this.carrito = [];
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }

    listar(){
        this.total = 0;
        this.cantidadProductos = 0;
        divCarrito.innerHTML = "";
        for(const producto of this.carrito){
            divCarrito.innerHTML +=  `
            <div class="productosCarrito">
                <h2>${producto.nombre}</h2>
                <p class="cantidad">${producto.precio}</p>
                <p>Cantidas: ${producto.cantidad}</p>
                <button class="btnQuitar" data-id="${producto.id}">SACAR DEL CARRITO</button>
            </div>
            `;
            this.total += producto.precio * producto.cantidad;
            this.cantidadProductos += producto.cantidad;
        }
        if(this.cantidadProductos > 0){
            botonComprar.style.display = "block";
        }else{
            botonComprar.style.display = "none";
        }


        const botonesQuitar = document.querySelectorAll(".btnQuitar");

        for(const boton of botonesQuitar){
            boton.addEventListener("click", (event)=>{
                event.preventDefault();
                const idProducto = Number(boton.dataset.id);
                this.quitar(idProducto)
            })
        }

        spanCantidadDeProductos.innerText = this.cantidadProductos;
        spanTotalProductos.innerText = this.total;
    }
}

const baseDeDatos = new BaseDeDatos();


const spanCantidadDeProductos = document.querySelector("#cantidadDeProductos");
const spanTotalProductos = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonesCategorias = document.querySelectorAll(".btnCategoria")


const carrito = new Carrito();

cargaProductos(baseDeDatos.traerRegistros());


botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", () => {
      const categoria = boton.dataset.categoria;
      if (categoria == "Todos") {
        cargaProductos(baseDeDatos.traerRegistros());
      } else {
        cargaProductos(baseDeDatos.registrosPorCategoria(categoria));
      }
    });
});


function cargaProductos(productos){
    divProductos.innerHTML = "";
    for(const producto of productos){
        divProductos.innerHTML += `
            <div class="producto">
                <img src="${producto.imagen}">
                <h3> ${producto.nombre}</h3>
                <p>${producto.dato}</p>
                <p>Precio:$ ${producto.precio}</p>
                <button class="btnAGREGAR" data-id="${producto.id}">AGREGAR AL CARRITO</button>
            </div>
        `;
    }

    const botonesAgregar = document.querySelectorAll(".btnAGREGAR");
    for(const boton of botonesAgregar){
        boton.addEventListener("click", (event)=>{
            event.preventDefault();
            const idProducto = Number(boton.dataset.id);
    
            const producto =  baseDeDatos.registroPorId(idProducto);

           carrito.agregar(producto);
           
           Toastify({
            text: `Se ha añadido ${producto.nombre} al carrito`,
            gravity: "bottom",
            position: "center",
            style:{
                background:"gray",
            }
          }).showToast();
        });
    }
}

inputBuscar.addEventListener("input", (event)=> {
    event.preventDefault();
    const palabra = inputBuscar.value;
    const productos = baseDeDatos.registrosPorNombre(palabra);
    cargaProductos(productos);
})

botonComprar.addEventListener("click", (event) => {
    event.preventDefault();
  
    Swal.fire({
      title: "¿Seguro que desea comprar los productos?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, seguro",
      cancelButtonText: "No, no quiero",
    }).then((result) => {
      if (result.isConfirmed) {
        carrito.vaciar();
        Swal.fire({
          title: "¡Compra realizada!",
          icon: "success",
          text: "Su compra fue realizada con éxito.",
          timer: 15000,
        });
      }
    });
});

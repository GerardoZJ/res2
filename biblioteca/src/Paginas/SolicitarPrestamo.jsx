import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Desings/SolicitarDesing.css';

export const SolicitarPrestamo = () => {
  const [books, setBooks] = useState([]); // Estado para almacenar los libros desde la base de datos
  const [search, setSearch] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [matricula, setMatricula] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState(1);
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const navigate = useNavigate();

  // Recuperar la matrícula del alumno que inició sesión
  useEffect(() => {
    const storedMatricula = localStorage.getItem('matricula'); // Recuperar matrícula de localStorage
    if (!storedMatricula) {
      alert('Por favor, inicia sesión para solicitar un préstamo.');
      navigate('/LoginAlum'); // Redirigir al login si no hay sesión activa
    } else {
      setMatricula(storedMatricula); // Establecer la matrícula en el estado
    }
  }, [navigate]);

  // Obtener los libros desde el backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/libros'); // Endpoint para obtener los libros
        if (response.ok) {
          const data = await response.json();
          setBooks(data); // Guardar los libros en el estado
        } else {
          console.error('Error al obtener los libros:', response.statusText);
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    };

    fetchBooks();
  }, []);

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length > 0) {
      const filtered = books.filter(book =>
        book.titulo.toLowerCase().startsWith(value.toLowerCase()) // Filtrar libros que comiencen con la letra ingresada
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
      setSelectedBook(null);
    }
  };

  // Seleccionar un libro de la lista
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setFilteredBooks([]);
    setSearch(book.titulo);
  };

// Manejar el envío del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedBook || !matricula || !fechaDevolucion) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  if (cantidadSolicitada > selectedBook.stock) {
    alert('La cantidad solicitada supera la disponibilidad.');
    return;
  }

  const newLoan = {
    fechaPrestamo: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    fechaDevolucion,
    matricula,
    ISBN: selectedBook.ISBN, // Asegúrate de que el campo ISBN coincida con tu base de datos
    cantidad: cantidadSolicitada,
  };

  try {
    const response = await fetch('http://localhost:5000/prestamos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLoan),
    });

    if (response.ok) {
      alert('Préstamo registrado exitosamente.');
      // Limpiar el formulario
      setFechaDevolucion('');
      setCantidadSolicitada(1);
      setSelectedBook(null);
      setSearch('');
    } else {
      alert('Error al registrar el préstamo. Por favor, intenta nuevamente.');
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);
    alert('Error al conectar con el servidor.');
  }
};

  return (
    <motion.div
      className="solicitar-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Solicitar Préstamo</h2>
      <form className="solicitar-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Matrícula del alumno:</label>
          <input 
            type="text" 
            placeholder="Ingrese matrícula" 
            value={matricula} 
            disabled // La matrícula no se puede editar
          />
        </div>
        <div className="search-box">
          <label>Buscar libro:</label>
          <input
            type="text"
            placeholder="Buscar libro por nombre"
            value={search}
            onChange={handleSearchChange}
            autoComplete="off"
          />
          {filteredBooks.length > 0 && (
            <ul className="suggestions">
              {filteredBooks.map(book => (
                <li key={book.id} onClick={() => handleSelectBook(book)}>
                  {book.titulo}
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedBook && (
          <div className="book-detail">
            <div className="book-info">
              <h3>{selectedBook.titulo}</h3>
              <p><strong>Autor:</strong> {selectedBook.autor}</p>
              <p><strong>ISBN:</strong> {selectedBook.ISBN}</p>
              <p><strong>Disponibles:</strong> {selectedBook.stock}</p>
            </div>
          </div>
        )}
        {selectedBook && (
          <div className="form-group">
            <label>Cantidad a solicitar:</label>
            <input 
              type="number" 
              min="1" 
              max={selectedBook.stock} 
              value={cantidadSolicitada}
              onChange={(e) => setCantidadSolicitada(Number(e.target.value))}
              required 
            />
          </div>
        )}
        <div className="form-group">
          <label>Fecha de devolución:</label>
          <input 
            type="date" 
            value={fechaDevolucion} 
            onChange={(e) => setFechaDevolucion(e.target.value)} 
            required 
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Solicitar Préstamo
        </motion.button>
      </form>
    </motion.div>
  );
};
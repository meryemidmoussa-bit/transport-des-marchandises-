import React, { useState } from 'react';
import api from '../api/axios';
import useFetch from '../hooks/useFetch';
import State from './State';

// fields : [{ name, label, type }]   columns : [{ key, label, render? }]
export default function CrudPage({ title, endpoint, fields, columns }) {
  const { data, loading, error, reload } = useFetch(endpoint);
  const empty = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, form);
      else await api.post(endpoint, form);
      setForm(empty);
      setEditId(null);
      setMessage('Enregistré');
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Échec de l’enregistrement');
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, item[f.name] ?? ''])));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    await api.delete(`${endpoint}/${id}`);
    reload();
  };

  return (
    <section>
      <h1>{title}</h1>
      <form className="form grid" onSubmit={handleSubmit}>
                <h2 className="fiche-titre">
          {editId ? `Modifier : ${title}` : `Nouveau : ${title}`}
        </h2>
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            <input
              name={f.name}
              type={f.type || 'text'}
              value={form[f.name]}
              onChange={handleChange}
              required
            />
          </label>
        ))}
        <div className="actions">
          <button className="btn" type="submit">
            {editId ? 'Mettre à jour' : 'Ajouter'}
          </button>
          {editId && (
            <button
              className="btn ghost"
              type="button"
              onClick={() => { setEditId(null); setForm(empty); }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
      {message && <p className="muted">{message}</p>}

      <State
        loading={loading}
        error={error}
        empty={data.length === 0}
        emptyText="Aucun élément pour le moment."
      />
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>
                ))}
                <td className="row-actions">
                  <button className="btn small ghost" onClick={() => handleEdit(item)}>
                    Modifier
                  </button>
                  <button className="btn small danger" onClick={() => handleDelete(item.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
import React, { useState } from 'react';
import { categoryService } from '../../services/categoryService';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState(() => categoryService.getAllCategories());
  const allEvents = eventService.getAllEvents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [iconName, setIconName] = useState('Sparkles');
  const [color, setColor] = useState('#7541C8');

  const refreshCategories = () => {
    setCategories(categoryService.getAllCategories());
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setIconName('Sparkles');
    setColor('#7541C8');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setShortDescription(cat.shortDescription);
    setIconName(cat.iconName);
    setColor(cat.color || '#7541C8');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name,
          slug,
          shortDescription,
          iconName,
          color
        });
        showToast('Category updated successfully!', 'success');
      } else {
        await categoryService.addCategory({
          name,
          slug,
          shortDescription,
          iconName,
          color
        });
        showToast('New category added!', 'success');
      }
      refreshCategories();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const updated = await categoryService.toggleCategoryActive(id);
      refreshCategories();
      showToast(`Category status set to ${updated.active ? 'Active' : 'Inactive'}.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTargetId) return;
    try {
      await categoryService.deleteCategory(deleteTargetId);
      refreshCategories();
      showToast('Category removed.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Event Categories Taxonomy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
            Manage category labels, slugs, icons, and discovery taxonomies.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Slug</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Assigned Events</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const assignedCount = allEvents.filter(e => e.categoryId === cat.id).length;

                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: 'var(--accent-lavender)',
                            color: cat.color || 'var(--dark-purple)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CategoryIcon name={cat.iconName} size={18} />
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {cat.slug}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: 280 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cat.shortDescription}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                      {assignedCount} {assignedCount === 1 ? 'event' : 'events'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleActive(cat.id)}
                        className={`badge-pill ${cat.active !== false ? 'badge-mint' : 'badge-gray'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {cat.active !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(cat.id)}
                          className="btn-ghost"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#DC2626' }}
                          title="Delete category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSaveCategory}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Design & Architecture"
              className="form-control"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Slug Identifier (URL friendly, must be unique) *</label>
            <input
              type="text"
              placeholder="e.g. design"
              className="form-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="form-label">Lucide Icon Name</label>
              <select
                className="form-control"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
              >
                <option value="Sparkles">Sparkles</option>
                <option value="Cpu">Cpu (Tech)</option>
                <option value="Palette">Palette (Art)</option>
                <option value="Music">Music (Concerts)</option>
                <option value="Briefcase">Briefcase (Business)</option>
                <option value="GraduationCap">GraduationCap (Learning)</option>
                <option value="Trophy">Trophy (Sports)</option>
                <option value="Utensils">Utensils (Food)</option>
                <option value="Layers">Layers</option>
              </select>
            </div>

            <div>
              <label className="form-label">Accent Color</label>
              <input
                type="color"
                className="form-control"
                style={{ padding: 4, height: 42 }}
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Short Description</label>
            <textarea
              rows={3}
              placeholder="Brief description for category card..."
              className="form-control"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to remove this category? If any events are linked to it, the platform safety guard will prevent its deletion."
        confirmText="Confirm Delete"
        danger={true}
      />
    </div>
  );
};

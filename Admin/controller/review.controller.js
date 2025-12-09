const path = require('path');
const mongoose = require('mongoose');
const Review = require('../../models/Review');
const Lugar = require('../model/lugar.model');
const User = require('../../User/model/user.model');

const { Types } = mongoose;

function sendView(res) {
  return res.sendFile(path.join(__dirname, '../views/reviews.html'));
}

function normalizeObjectId(value) {
  if (!value || typeof value !== 'string') return null;
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

function buildBasePipeline({ rating, lugarId, userId, q }) {
  const pipeline = [];
  const initialMatch = {};

  if (rating) {
    const parsed = Number(rating);
    if (!Number.isNaN(parsed)) {
      initialMatch.rating = parsed;
    }
  }

  const lugarObjectId = normalizeObjectId(lugarId);
  if (lugarObjectId) {
    initialMatch.lugar = lugarObjectId;
  }

  const userObjectId = normalizeObjectId(userId);
  if (userObjectId) {
    initialMatch.user = userObjectId;
  }

  if (Object.keys(initialMatch).length) {
    pipeline.push({ $match: initialMatch });
  }

  pipeline.push(
    {
      $lookup: {
        from: User.collection.name,
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Lugar.collection.name,
        localField: 'lugar',
        foreignField: '_id',
        as: 'lugar'
      }
    },
    { $unwind: { path: '$lugar', preserveNullAndEmptyArrays: true } }
  );

  if (q && typeof q === 'string' && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    pipeline.push({
      $match: {
        $or: [
          { comment: regex },
          { 'user.name': regex },
          { 'user.email': regex },
          { 'lugar.nombre': regex },
          { 'lugar.categoria': regex }
        ]
      }
    });
  }

  return pipeline;
}

exports.view = (req, res) => sendView(res);

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { q = '', rating, lugarId, userId } = req.query;

  const [sortFieldRaw, sortDirRaw] = String(req.query.sort || 'createdAt:desc').split(':');
  const allowedSort = { createdAt: 'createdAt', updatedAt: 'updatedAt', rating: 'rating' };
  const sortField = allowedSort[sortFieldRaw] || 'createdAt';
  const sortDir = sortDirRaw === 'asc' ? 1 : -1;

  const basePipeline = buildBasePipeline({ rating, lugarId, userId, q });
  const dataPipeline = [
    ...basePipeline,
    { $sort: { [sortField]: sortDir, _id: sortDir === 1 ? 1 : -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        rating: 1,
        comment: { $ifNull: ['$comment', ''] },
        createdAt: 1,
        updatedAt: 1,
        lugar: {
          _id: '$lugar._id',
          nombre: '$lugar.nombre',
          categoria: '$lugar.categoria'
        },
        user: {
          _id: '$user._id',
          name: '$user.name',
          email: '$user.email'
        }
      }
    }
  ];

  const countPipeline = [...basePipeline, { $count: 'total' }];
  const summaryPipeline = [...basePipeline, { $group: { _id: '$rating', count: { $sum: 1 } } }];

  try {
    const [items, countResult, ratingSummary] = await Promise.all([
      Review.aggregate(dataPipeline),
      Review.aggregate(countPipeline),
      Review.aggregate(summaryPipeline)
    ]);

    const total = countResult[0] ? countResult[0].total : 0;
    const summary = ratingSummary
      .sort((a, b) => b._id - a._id)
      .map(entry => ({ rating: entry._id, count: entry.count }));

    res.json({ data: items, page, limit, total, ratingSummary: summary });
  } catch (error) {
    console.error('Error al listar reseñas:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

exports.meta = async (req, res) => {
  try {
    const [lugares, usuarios] = await Promise.all([
      Lugar.find({}, 'nombre categoria').sort({ nombre: 1 }).limit(200).lean(),
      User.find({}, 'name email').sort({ name: 1 }).limit(200).lean()
    ]);

    res.json({
      lugares: lugares.map(l => ({ _id: l._id, nombre: l.nombre, categoria: l.categoria })),
      usuarios: usuarios.map(u => ({ _id: u._id, name: u.name, email: u.email }))
    });
  } catch (error) {
    console.error('Error al cargar meta de reseñas:', error);
    res.status(500).json({ message: 'Error al cargar datos de apoyo' });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }
    res.json({ deleted: true, reviewId: deleted._id });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ message: 'Error al eliminar la reseña' });
  }
};

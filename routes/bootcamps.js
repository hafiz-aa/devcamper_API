const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
	res.status(200).send({ success: true, message: 'Show all bootcamps' })
})
router.get('/:id', (req, res) => {
	res.status(200).send({ success: true, message: `Get bootcamp ${req.params.id}` })
})
router.post('/', (req, res) => {
	res.status(200).send({ success: true, message: 'Create new bootcamp' })
})
router.put('/:id', (req, res) => {
	res.status(200).send({ success: true, message: `Bootcamp ${req.params.id} updated` })
})
router.delete('/:id', (req, res) => {
	res.status(200).send({ success: true, message: 'Bootcamp deleted' })
})

module.exports = router
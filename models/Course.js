const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add course title"]
	},
	description: {
		type: String,
		required: [true, "Please add a description"]
	},
	weeks: {
		type: String,
		required: [true, "Please add a number of weeks"]
	},
	tuition: {
		type: Number,
		required: [true, "Please add a tuition"]
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minimum skill"],
		enum: ['beginner', 'intermediate', 'advance']
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		defaulte: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
})

// Static method to get average of course tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {

	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId }
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' }
			}
		}
	])

	// Update the average cost to the database
	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10
		})
	} catch (err) {
		console.error(err)

	}
}

// Call getAverageCosr after save
CourseSchema.post('save', function () {
	this.constructor.getAverageCost(this.bootcamp)
})
// Call getAverageCosr before remove
CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.mongoose.model('Course', CourseSchema)
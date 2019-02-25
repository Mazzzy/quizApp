<template>
  <div class="app__question" v-if="!loader && start && !result">
	<div class="app__question-header">
		<span class="app__question-counter">{{totalAnswers + 1}}/{{questionAmount}}</span>
		<h3 class="app__question-title" v-html="question.question"></h3>
		<p class="app__question-caption" v-if="question.caption" v-html="question.caption"></p>
	</div>
	<div class="app__question-form" v-if="question.type == 'radio'">
		<div class="question-form__item" v-for="(answer, index) in question.answers" :key='index'>
			<label class="question-form__item-label">
				<input class="radio" type="radio" v-bind:value="index" v-model="pickedAnswer">
				<span class="radio__custom"></span>
				<span class="radio__text">{{answer}}</span>
			</label>
		</div>
	</div>
	<div class="app__question-form" v-if="question.type == 'checkbox'">
		<div class="question-form__item" v-for="(answer, index) in question.answers" :key='index'>
			<label class="question-form__item-label form-switch">
				<input class="checkbox" type="checkbox" v-bind:value="index" v-model="pickedAnswer">
				<span class="checkbox__custom"></span>
				<span class="checkbox__text">{{answer}}</span>
			</label>
		</div>
	</div>
	<div class="app__question-form" v-if="question.type == 'input'">
		<div class="form-group">
			<input class="form-input" type="text" v-model="pickedAnswer" placeholder="Answer" />
		</div>
	</div>
	<button class="app__btn btn btn--bold btn--center" v-on:click="checkAnswer(question)">Next</button>
  </div>
</template>
<script>
export default {
  name: 'Questions',
  data () {
	return {
		loading:false,
		start: false,
		questionAmount: 15,
		loader: false,
		correct: 0,
		totalAnswers: 0,
		wrongAnswers: false,
		question: null,
		allQuestions: null,
		pickedAnswer: null,
		result: false
	}
	},
	computed: {
		// Show different result message depending on the percentage of correct answers
		resultMessage: function() {
			var resultScore = this.correct / this.totalAnswers
			if (resultScore == 1) {
				return "Excellent!"
			} else if (resultScore >= 0.8) {
				return "Good job!"
			} else if (resultScore >= 0.5) {
				return "Not very impressive, but enough"
			} else if (resultScore>= 0.2) {
				return "Bad luck — but don't give up!"
			} else {
				return "Did you even try?"
			}
		}
	},
	methods: {
		// Reset params before start
		load: function() {
			this.start = true
			this.loader = true
			this.result = false
			this.correct = 0
			this.totalAnswers = 0
			self.wrongAnswers = false
			this.loadAllQuestions()
		},
		loadAllQuestions: function() {
			var self = this
			$.getJSON("data/data.json",function (data) {
				// Fetching data from the data/data.json file
				// Put all questions inside the data > questions

				self.allQuestions = data.questions
				// Check if the amount of questions exists
				if(self.questionAmount > data.questions.length) {
					alert("Error. There are only " + data.questions.length + " questions in database.")
					// if there is less questions then the amount picked set the questionAmount to the total number of questions
					self.questionAmount = data.questions.length
				}
				// Load question
				self.loadQuestion()
			});
		},
		loadQuestion: function() {
			var self = this
			// Check if there are any more questions to answer
			if(self.totalAnswers + 1 <= self.questionAmount) {
				var pickQ = Math.floor(Math.random()*self.allQuestions.length)
				var question = self.allQuestions[pickQ]

				// Check question type
				if(question.type == 'radio' || question.type == 'input') {
					self.pickedAnswer = null
				} else if (question.type == 'checkbox') {
					self.pickedAnswer = []
				}
				// Remove this question from the total pool of questions so it won't show again
				self.allQuestions.splice(pickQ, 1)
				// Set the vue data question to the question
				self.question = question
				// Turn off loading. This goes quickly so loading almost never shows
				self.loader = false
			} else {
				// if no more questions — show results
				self.result = true
				self.start = false
			}
		},
		checkAnswer: function(question) {
			var self = this
			// Check question type
			if(question.type == 'radio' || question.type == 'input') {
				if(question.correct == self.pickedAnswer) {
					self.correct++
					self.wrongAnswers = false
				} else {
					self.wrongAnswers = true
				}
			} else if (question.type == 'checkbox') {
				// if checkboxes then transform the objects into array...
				var pickedAnswers = $.makeArray( self.pickedAnswer )
				var correctAnswers = $.makeArray(question.correct)

				// Then sort both arrays so they are comparable
				if(pickedAnswers.sort().join(',') === correctAnswers.sort().join(',')){
					self.correct++
					self.wrongAnswers = false
				} else {
					self.wrongAnswers = true
				}
			}
			self.totalAnswers++
			self.loadQuestion()
		}
	}
}
</script>
<style scoped>
</style>

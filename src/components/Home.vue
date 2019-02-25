<template>
  <div class="app">
	<div class="app__head">
		<h1 class="app__head-title">General Knowledge Quiz</h1>
		<h2 class="app__head-subtitle">Simple quiz about everything</h2>
		<div class="app__head-description" v-if="!loading && !start && !result">
			<p>General knowledge quiz questions and answers have been added for you to test your knowledge about the world. You will find questions on general facts, geography, biology and others. Good luck!</p>
			<p><em>Select the number of questions and press Start.</em></p>
		</div>
	</div>
	<Loader v-bind:loader='loader'/>
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
		<button class="app__btn btn btn--bold btn-left" v-on:click="prevAnswer()">Prev</button>
		<button class="app__btn btn btn--bold btn-right" v-on:click="checkAnswer(question)">Next</button>
	</div>
	<div class="app__result" v-if="result">
		<h3 class="text-center">Your result: {{correct}}/{{totalAnswers}}</h3>
		<h4 class="text-center">{{resultMessage}}</h4>
	</div>
	<div v-if="!start" class="app__start">
		<div class="form-group">
			<select v-model="questionAmount" class="form-select select-lg">
				<option value="10">10 questions</option>
				<option value="15">15 questions</option>
				<option value="20">20 questions</option>
			</select>
		</div>
		<button class="app__btn btn btn--bold btn--center" v-on:click="load()">Start</button>
	</div>
  </div>
</template>

<script>
import Loader from './Loader.vue'

export default {
  name: 'Home',
  components: {
    Loader
  },
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
		result: false,
		visitedQuestions: null,
		visitedCount: 0
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
		this.wrongAnswers = false
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
			
			self.visitedQuestions = [];
			self.visitedCount = 0;
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

			// Hold the visited questions for prev button feature
			self.visitedQuestions.push(question);
			self.visitedCount++;

			// Turn off loading. This goes quickly so loading almost never shows
			self.loader = false
		} else {
			// if no more questions — show results
			self.result = true
			self.start = false
		}
	},
	prevAnswer: function(){
		var self = this;
		self.visitedCount--;
		var question = self.visitedQuestions[self.visitedCount - 1];
		// Set the vue data question to the question
		self.question = question;
		self.totalAnswers--;
	},
	checkAnswer: function(question) {
		var self = this
		if(self.visitedCount < self.visitedQuestions.length){
			self.nextVistedAnswer();
		}else {
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
		
	},
	nextVistedAnswer: function(){
		var self = this;
		var question = self.visitedQuestions[self.visitedCount];
		// Set the vue data question to the question
		self.question = question;
		self.visitedCount++;
		self.totalAnswers++;
	}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Hide placeholder on focus */
:focus::-webkit-input-placeholder {color: transparent}
:focus::-moz-placeholder {color: transparent}
:focus:-moz-placeholder {color: transparent}
:focus:-ms-input-placeholder {color: transparent}

html {
	box-sizing: border-box;
}

body {
	margin: 0;
	padding: 0;
	background-color: #fafbfc;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
}

.header {
	text-align: center;
	margin: 20px auto;
}

.header__logo {
	font-size: 26px;
	font-weight: 600;
	line-height: 1;
	letter-spacing: 0.04em;
	text-decoration: none;
	color: #111;
}

.header__logo:hover {
	color: #C43434;
}

pre {
	background: #f9f9f9;
	border-left: 4px solid #558abb;
	margin-bottom: 1em;
	margin-top: 1em;
	padding: 15px 25px;
	font-style: initial;
}

.app {
	min-width: 320px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 650px;
	min-height: 600px;
	background: #fff;
	border: 1px solid #ccc;
	border-radius: 2px;
	padding: 24px;
	flex-direction: column;
	margin: 0 auto;
}

.app__head-title {
	text-align: center;
	font-size: 28px;
	font-weight: bold;
	margin: 0;
}

.app__head-subtitle {
	text-align: center;
	font-size: 24px;
	font-weight: 400;
	margin: 0 0 20px 0;
}

.app__head-description {
	margin-bottom: 20px;
}

.app__loader {
	margin: auto;
}

.app__question-header {
	margin-bottom: 15px;
}

.app__question-form {
	margin-bottom: 20px;
}

.form-group {
	text-align: center;
	margin-bottom: 20px;
}

.form-select {
	font-size: 20px;
	height: 40px;
	border-radius: 4px;
}

.app__question-caption {
	margin-top: 5px;
	font-style: italic;
}

.question-form__item {
	border-top: 1px solid #e6e6e6;
}

.question-form__item:last-child {
	border-bottom: 1px solid #e6e6e6;
}

.question-form__item-label {
	padding: 15px;
	display: block;
}

input[type="text"] {
	border: 1px solid #CCC;
	border-radius: 2px;
	width: 96%;
	font-size: 16px;
	padding: 12px;
}

.btn {
	-moz-appearance: none;
	-webkit-box-shadow: none;
	box-shadow: none;
	border-radius: 2px;
	border-style: solid;
	border-width: 0;
	font-size: 16px;
	cursor: pointer;
	margin: 0;
	text-align: center;
	text-decoration: none;
	background-color: #3f4658;
	color: #000;
	-webkit-transition: background-color .2s ease;
	transition: background-color .2s ease;
	background-color: #eee;
	border: 1px solid #d3d3d3;
}

.btn--center {
	display: block;
	margin: 0 auto;
}

.btn--bold {
	font-weight: bold;
}

.btn-left {
	float: left;
}

.btn-right {
	float:right;
}

.app__btn {
	min-width: 100px;
	padding: 12px 20px;
}

.app__question-counter {
	display: block;
	margin-bottom: 20px;
	color: #B3B3B3;
	text-align: center;
}

.app__result {
	text-align: center;
	width: 275px;
	margin: auto;
	font-size: 28px;
}

.footer {
	margin-top: 10px;
	color: #999;
	text-align: center;
}

.checkbox, .radio {
	display: none;
}

.checkbox__custom,
.radio__custom {
	position: relative;
	width: 20px;
	height: 20px;
	border: 2px solid #429DEF;
	border-radius: 2px;
}

.checkbox__custom,
.checkbox__text,
.radio__custom,
.radio__text {
	display: inline-block;
	vertical-align: middle;
}

.checkbox:checked + .checkbox__custom::before,
.radio:checked + .radio__custom::before {
	content: "";
	display: block;
	position: absolute;
	top: 3px;
	right: 3px;
	bottom: 3px;
	left: 3px;
	background: #429DEF;
}

.radio__custom,
.radio:checked + .radio__custom::before {
	border-radius: 50%;
}

.footer {
	font-size: 14px;
}

.footer__copyright-link {
	color: #999;
	font-weight: bold;
	text-decoration: underline;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	transition: all 0.3s;
}

.footer__copyright-link:hover {
	color: #C00;
}
</style>

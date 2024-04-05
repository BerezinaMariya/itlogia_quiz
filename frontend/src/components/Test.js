import {UserParamsManager} from "../../utils/user-params-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Test {
    constructor() {
        this.quiz = null;
        this.progressBarElement = null;
        this.questionTitleElement = null;
        this.questionOptionsElement = null;
        this.nextButtonElement = null;
        this.passButtonElement = null;
        this.passButtonImageElement = null;
        this.prevButtonElement = null;
        this.currentQuestionIndex = 1;  // Когда попадаем на страницу теста, всегда начинаем с первого вопроса
        this.questions = {};
        this.userResult = [];

        this.testId = JSON.parse(sessionStorage.getItem('testId'));

        UserParamsManager.checkUserData();
        this.init();
    }

    async init() {
        if (this.testId) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.testId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result;
                    this.startQuiz();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    startQuiz() {
        this.progressBarElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('question-title');
        document.getElementById('pre-title').innerText = this.quiz.name;
        this.questionOptionsElement = document.getElementById('question-options');

        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next');

        this.passButtonElement = document.getElementById('pass');
        this.passButtonElement.onclick = this.move.bind(this, 'pass');
        this.passButtonImageElement = document.getElementById('pass-img');

        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59;
        timerElement.innerText = seconds;

        this.interval = setInterval(function () {
            if (seconds === 0) {
                this.complete();
                clearInterval(this.interval);
            }
            seconds--;
            timerElement.innerText = seconds;

        }.bind(this), 1000);
    }

    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'test__progress-bar-item ' + (i === 0 ? 'test__progress-bar-item_active' : '');

            const itemCircleElement = document.createElement('div');
            itemCircleElement.className = 'test__progress-bar-item_circle';

            const itemTextElement = document.createElement('div');
            itemTextElement.className = 'test__progress-bar-item_text';
            itemTextElement.innerText = 'Вопрос ' + (i + 1);

            itemElement.appendChild(itemCircleElement);
            itemElement.appendChild(itemTextElement);

            this.progressBarElement.appendChild(itemElement);
        }
    }

    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1]; // так как индексы с бэка начинаются с 0, а у нас с 1
        this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> ' + activeQuestion.question;
        this.questionOptionsElement.innerHTML = '';

        const that = this;
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);

        activeQuestion.answers.forEach(answer => {
            const questionOptionElement = document.createElement('div');
            questionOptionElement.className = 'common-question-option';

            const inputId = 'answer-' + answer.id;
            const questionInputElement = document.createElement('input')
            questionInputElement.setAttribute('id', inputId);
            questionInputElement.setAttribute('type', 'radio');
            questionInputElement.setAttribute('name', 'answer');
            questionInputElement.setAttribute('value', answer.id);
            questionInputElement.className = 'option-answer';

            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                questionInputElement.setAttribute('checked', 'checked');
            }

            questionInputElement.onchange = function () {
                that.chooseAnswer();
            }

            const questionLabelElement = document.createElement('label');
            questionLabelElement.setAttribute('for', inputId);
            questionLabelElement.innerText = answer.answer;

            questionOptionElement.appendChild(questionInputElement);
            questionOptionElement.appendChild(questionLabelElement);

            this.questionOptionsElement.appendChild(questionOptionElement);
        });

        if (chosenOption && chosenOption.chosenAnswerId) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passButtonElement.classList.add('test__pass-button_disabled');
            this.passButtonImageElement.setAttribute('src', 'images/small-arrow-grey.png');
        } else {
            this.nextButtonElement.setAttribute('disabled', 'disabled');
            this.passButtonElement.classList.remove('test__pass-button_disabled');
            this.passButtonImageElement.setAttribute('src', 'images/small-arrow.png');
        }

        if (this.currentQuestionIndex === this.quiz.questions.length) {
            this.nextButtonElement.innerText = 'Завершить';
        } else {
            this.nextButtonElement.innerText = 'Далее';
        }

        if (this.currentQuestionIndex > 1) {
            this.prevButtonElement.removeAttribute('disabled');
        } else {
            this.prevButtonElement.setAttribute('disabled', 'disabled');
        }
    }

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passButtonElement.classList.add('test__pass-button_disabled');
        this.passButtonImageElement.setAttribute('src', 'images/small-arrow-grey.png');
    }

    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
            return element.checked;
        });
        let chosenAnswerId = null;

        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult = this.userResult.find(item => item.questionId === activeQuestion.id);

        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId
            });
        }

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            this.complete();
            clearInterval(this.interval);
            return;
        }

        Array.from(this.progressBarElement.children).forEach((item, index) => {
            const currentItemIndex = index + 1;
            item.classList.remove('test__progress-bar-item_complete');
            item.classList.remove('test__progress-bar-item_active');

            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('test__progress-bar-item_active')
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('test__progress-bar-item_complete')
            }
        });

        this.showQuestion();
    }

    async complete() {
        const userInfo = Auth.getUserInfo();

        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(config.host + '/tests/' + this.testId + '/pass', 'POST', {
                userId: userInfo.userId,
                results: this.userResult
            });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                location.href = '#/result';
            }
        } catch (error) {
            console.log(error);
        }
    }
}


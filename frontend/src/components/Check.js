import {UserParamsManager} from "../../utils/user-params-manager.js";
import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Check {
    constructor() {
        this.testId = null;
        this.answers = null;
        this.quiz = null;
        this.answersElement = null;
        this.testId = JSON.parse(sessionStorage.getItem('testId'));
        this.userInfo = Auth.getUserInfo();

        UserParamsManager.checkUserData();
        this.init();
    }
    async init() {

        if (!this.userInfo) {
            location.href = '#/';
        }

        if (this.testId) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.testId + '/result/details?userId=' + this.userInfo.userId);

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.quiz = result;
                    this.startCheck();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    startCheck() {
        const preTitle = document.getElementById('pre-title');
        preTitle.innerHTML = preTitle.innerHTML + '<span>' + this.quiz.test.name + '</span>';

        document.getElementById('user-info').innerHTML =
            'Тест выполнил <span>' + this.userInfo.fullName + ', ' + this.userInfo.email + '</span>';

        this.showQuestions();
    }

    showQuestions() {
        this.answersElement = document.getElementById('answers');

        const that = this;

        this.quiz.test.questions.forEach((question, index) => {
            const answersItemElement = document.createElement('div');
            answersItemElement.className = 'check__answers-item';

            const answersTitleElement = document.createElement('div');
            answersTitleElement.className = 'check__answers-title common-question-title';
            answersTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;

            answersItemElement.appendChild(answersTitleElement);
            this.answersElement.appendChild(answersItemElement);

            that.showAnswers(question);
        });
    }

    showAnswers(question) {
        const answerOptionsElement = document.createElement('div');
        answerOptionsElement.className = 'check__question-options';

        question.answers.forEach(answer => {
            const answerOptionElement = document.createElement('div');
            answerOptionElement.className = 'common-question-option';

            const inputId = 'answer-' + answer.id;
            const answerInputElement = document.createElement('input')
            answerInputElement.setAttribute('id', inputId);
            answerInputElement.setAttribute('type', 'radio');
            answerInputElement.setAttribute('disabled', 'disabled');
            answerInputElement.setAttribute('name', 'answer');
            answerInputElement.setAttribute('value', answer.id);
            answerInputElement.className = 'option-answer';

            const answerLabelElement = document.createElement('label');
            answerLabelElement.setAttribute('for', inputId);
            answerLabelElement.innerText = answer.answer;

            if (answer.hasOwnProperty('correct')) {
                if (answer.correct) {
                    answerOptionElement.classList.add('right');
                } else {
                    answerOptionElement.classList.add('wrong');
                }
            }

            answerOptionElement.appendChild(answerInputElement);
            answerOptionElement.appendChild(answerLabelElement);
            answerOptionsElement.appendChild(answerOptionElement);
            this.answersElement.appendChild(answerOptionsElement);
        });
    }
}


(function () {
    const Check = {
        params: {},
        userResult: [],
        testId: null,
        answers: null,
        quiz: null,
        currenQuestionIndex: 1,
        answersElement: null,
        answersTitleElement: null,
        init() {
            checkUserData();
            this.getParams();

            if (this.testId) {
                this.getQuiz();
            } else {
                location.href = 'index.html';
            }
        },
        getParams() {
            this.params = JSON.parse(sessionStorage.getItem('params'));
            this.testId = this.params.testId;
        },
        getAnswers() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quiz-right?id=' + this.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.answers = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
        },
        getQuiz() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quiz?id=' + this.testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }

                this.startCheck();
            } else {
                location.href = 'index.html';
            }
        },
        startCheck() {
            let preTitle = document.getElementById('pre-title');
            preTitle.innerHTML = preTitle.innerHTML + '<span>' + this.quiz.name + '</span>';

            document.getElementById('user-info').innerHTML =
                'Тест выполнил <span>' + this.params.name + ', ' + this.params.email + '</span>';

            this.showQuestions();
        },
        showQuestions() {
            this.answersElement = document.getElementById('answers');

            const that = this;

            console.log(this.quiz.questions);

            this.quiz.questions.forEach((question, index) => {
                const answersItemElement = document.createElement('div');
                answersItemElement.className = 'check__answers-item';

                const answersTitleElement = document.createElement('div');
                answersTitleElement.className = 'check__answers-title common-question-title';
                answersTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;

                answersItemElement.appendChild(answersTitleElement);
                this.answersElement.appendChild(answersItemElement);

                that.showAnswers(question, index);
            });
        },
        showAnswers(question, questionIndex) {
            this.getAnswers();

            this.currentQuestionIndex = questionIndex;
            this.userResult = JSON.parse(sessionStorage.getItem('userResult'));
            const chosenOption = this.userResult[this.currentQuestionIndex];

            const answerOptionsElement = document.createElement('div');
            answerOptionsElement.className = 'check__question-options';

            question.answers.forEach((answer) => {
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

                if (chosenOption && chosenOption.chosenAnswerId === answer.id && chosenOption.chosenAnswerId === this.answers[this.currentQuestionIndex]) {
                    answerOptionElement.classList.add('right');
                } else if (chosenOption && chosenOption.chosenAnswerId === answer.id && chosenOption.chosenAnswerId !== this.answers[this.currentQuestionIndex]) {
                    answerOptionElement.classList.add('wrong');
                }

                answerOptionElement.appendChild(answerInputElement);
                answerOptionElement.appendChild(answerLabelElement);
                answerOptionsElement.appendChild(answerOptionElement);
                this.answersElement.appendChild(answerOptionsElement);
            });
        }
    }

    Check.init();
})();

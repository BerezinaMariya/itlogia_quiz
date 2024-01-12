(function () {
    const Result = {
        init() {
            const params = JSON.parse(sessionStorage.getItem('params'));
            console.log(params);
            const score = params.score;
            const total = params.total;

            document.getElementById('result-score').innerText = score + '/' + total;

            this.linkElement = document.getElementById('next-page');
            this.linkElement.onclick = this.move.bind(this);
        },
        move() {
            location.href = 'check.html';
        }
    }

    Result.init();
})();

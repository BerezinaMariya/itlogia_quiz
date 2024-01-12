function checkUserData() {
    const params = JSON.parse(sessionStorage.getItem('params'));

    if(!params.name || !params.lastName || !params.email) {
        location.href = 'index.html';
    }
}

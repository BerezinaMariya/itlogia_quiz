export class UserParamsManager {
    static checkUserData() {
        const testId = JSON.parse(sessionStorage.getItem('testId'));

        if(!testId) {
            location.href = '#/';
        }
    }
}

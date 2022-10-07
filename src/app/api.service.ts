import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // public BASE_URL = 'http://localhost:8000';
  public BASE_URL = 'https://magnaapp.herokuapp.com';
  public TOKEN: string | undefined = undefined;
  public COMPANY_ID!: number;
  public currentCompany: any;

  public getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.TOKEN,
    };
  }

  // public setCompany(inc: any) {
  //   this.COMPANY_ID = inc.id;
  //   this.currentCompany = inc;
  //   localStorage.setItem('company', JSON.stringify(inc));
  //   document.title = inc.name;
  // }

  public getTokenHeaders() {
    return {
      Authorization: 'Bearer ' + this.TOKEN,
    };
  }

  constructor() {
    // const comp = localStorage.getItem('company');
    // if (comp) {
    //   const inc = JSON.parse(comp);
    //   if (inc) this.setCompany(inc);
    // }
  }

  public setToken(token: string|undefined) {
    this.TOKEN = token;
  }

  public async login(loginData: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(`${this.BASE_URL}/auth/login`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not login');
    }
    return jsonRes;
  }

  public async signup(loginData: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(`${this.BASE_URL}/auth/signup`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not signup');
    }
    return jsonRes;
  }

  public async getCompanyJobOffers() {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getJobOffers/${this.COMPANY_ID}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not login');
    }
    return jsonRes;
  }

  public async getExamQuizs(examId: number) {
    const response = await fetch(
      `${this.BASE_URL}/exam/getExamQuizs/${examId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getExamQuizs');
    }
    return jsonRes;
  }

  public async getCompanyExams(status: string) {
    const response = await fetch(`${this.BASE_URL}/exam/getExams/${this.COMPANY_ID}/${status}`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getCompanyExams');
    }
    return jsonRes;
  }

  public async getCompanyQuizs() {
    const response = await fetch(`${this.BASE_URL}/quiz/getQuizs/${this.COMPANY_ID}`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getCompanyQuizs');
    }
    return jsonRes;
  }

  public async addJobOffer(data: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/jobOffer/createJobOffer`, opts);
    const jsonRes = await response.json();
    
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createJobOffer');
    }
    return jsonRes;
  }

  public async addQuizsToExam(examId: number, quizIds: number[]) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(quizIds),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/exam/addQuizsToExam/${examId}`, opts);
    const jsonRes = await response.json();
    console.log(response, jsonRes);
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      return Promise.reject(response);
      throw new Error(jsonRes?.message || 'Could not addQuizsToExam');
    }
    return jsonRes;
  }

  public async addExamQuiz(examId: number, quizId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/exam/addQuizToExam/${examId}/${quizId}/1`, opts);
    const jsonRes = await response.json();
    console.log(response, jsonRes);
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addExamQuiz');
    }
    return jsonRes;
  }

  public async removeExamQuiz(examId: number, quizId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/exam/removeExamQuiz/${examId}/${quizId}`, opts);
    const jsonRes = await response.json();
    console.log(response, jsonRes);
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeExamQuiz');
    }
    return jsonRes;
  }

  public async addExam(data: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/exam/createExam`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createExam');
    }
    return jsonRes;
  }

  public async getUserCompanies() {
    const response = await fetch(`${this.BASE_URL}/company/getUserCompanies`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserCompanies');
    }
    return jsonRes;
  }

  public async addCompany(data: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/company/newCompany`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not login');
    }
    return jsonRes;
  }

  public async getJobOfferSkills(jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getJobOfferSkills/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getJobOfferRequiredSkills');
    }
    return jsonRes;
  }

  public async getJobOffer(jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getJobOffer/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getJobOfferBonusSkills');
    }
    return jsonRes;
  }

  public async getExam(examId: number) {
    const response = await fetch(
      `${this.BASE_URL}/exam/getExam/${examId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getExam');
    }
    return jsonRes;
  }

  public async getJobOfferUserApplicationsList(jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getJobOfferUserApplicationsList/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(
        jsonRes?.message || 'Could not getJobOfferUserApplicationsList'
      );
    }
    return jsonRes;
  }

  public async getExamUserApplicationsList(examId: number) {
    const response = await fetch(
      `${this.BASE_URL}/exam/getExamUserApplicationsList/${examId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(
        jsonRes?.message || 'Could not getExamUserApplicationsList'
      );
    }
    return jsonRes;
  }

  public async getJobOfferQuizs(jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/quiz/getJobOfferQuizs/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getJobOfferQuizs');
    }
    return jsonRes;
  }

  public async addQuiz(data: any, jQuizId: any | null = null) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/${
        jQuizId && jQuizId !== 'new' ? 'updateQuizAndJobOfferQuiz/' + jQuizId : 'createQuiz'
      }`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addQuiz');
    }
    return jsonRes;
  }

  public async createQuiz(data: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/quiz/createQuiz`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createQuiz');
    }
    return jsonRes;
  }

  public async getQuiz(quizId: number) {
    const response = await fetch(`${this.BASE_URL}/quiz/getQuiz/${quizId}`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getQuiz');
    }
    return jsonRes;
  }

  public async addQuizTest(data: any, testId: number|string|null = null) {
    console.log(data);
    const file = data.fileDetails.file;
    let formData = new FormData();
    file && file !== '' && file !== ' ' && formData.append('file', file);
    if (data.fileDetails.file === 'cancel') data.test.file = 'cancel';
    formData.append(
      'data',
      JSON.stringify(testId === 'new' ? data : data.test)
    );
    // Object.keys(data).forEach(key => {
    //   formData.append(key, data[key]);
    // });
    const opts = {
      method: 'POST',
      body: formData,
      headers: this.getTokenHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/${
        testId && testId !== 'new' ? 'updateTest/' + testId : 'createTest'
      }`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addTest');
    }
    return jsonRes;
  }

  public async getQuizTest(testId: number) {
    const response = await fetch(`${this.BASE_URL}/quiz/getTest/${testId}`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getQuizTest');
    }
    return jsonRes;
  }

  public async updateTestOption(data: any, optionId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/editTestOption/${optionId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateTestOption');
    }
    return jsonRes;
  }

  public async updateQuiz(data: any, quizId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/updateQuiz/${quizId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateQuiz');
    }
    return jsonRes;
  }

  public async updateTestText(data: any, textId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/editTestText/${textId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addTest');
    }
    return jsonRes;
  }

  public async createNewTestOption(data: any, testId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/createNewTestOption/${testId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewTestOption');
    }
    return jsonRes;
  }

  public async createNewTestText(data: any, testId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/createNewTestText/${testId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewTestText');
    }
    return jsonRes;
  }

  public async removeTestOption(optionId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/removeTestOption/${optionId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewTestText');
    }
    return jsonRes;
  }

  public async removeTestText(textId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/removeTestText/${textId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewTestText');
    }
    return jsonRes;
  }

  public async getUsersDataOptions() {
    const response = await fetch(`${this.BASE_URL}/jobOffer/getUsersDataOptions`, {
      headers: this.getHeaders(),
    });
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUsersDataOptions');
    }
    return jsonRes;
  }

  public async getJobOfferUserData(jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getJobOfferUserData/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getJobOfferUserData');
    }
    return jsonRes;
  }

  public async getExamUserReport(userId: number, examId: number) {
    const response = await fetch(
      `${this.BASE_URL}/exam/getExamUserReport/${userId}/${examId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getExamUserReport');
    }
    return jsonRes;
  }

  public async addJobOfferUserData(jobOfferId: number, optionId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/addJobOfferUserData/${jobOfferId}/${optionId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addJobOfferUserData');
    }
    return jsonRes;
  }

  public async assignPointToUserTest(point: number, userTestId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userApplication/exam/assignPointToUserTest/${point}/${userTestId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not assignPointToUserTest');
    }
    return jsonRes;
  }

  public async removejobOfferUserData(jobOfferId: number, optionId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/removejobOfferUserData/${jobOfferId}/${optionId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removejobOfferUserData');
    }
    return jsonRes;
  }

  public async updateJobOfferSkill(skill: any, skillId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(skill),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/editJobOfferSkill/${skillId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateJobOfferSkill');
    }
    return jsonRes;
  }

  public async addJobOfferSkill(skill: any) {
    console.log(skill);
    
    const opts = {
      method: 'POST',
      body: JSON.stringify(skill),
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/jobOffer/addJobOfferSkill`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addJobOfferSkill');
    }
    return jsonRes;
  }

  public async deleteJobOfferSkill(skillId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/removeJobOfferSkill/${skillId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not deleteJobOfferSkill');
    }
    return jsonRes;
  }

  public async updateJobOffer(jobOffer: any, jobOfferId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(jobOffer),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/updateJobOffer/${jobOfferId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not deleteJobOfferSkill');
    }
    return jsonRes;
  }

  public async updateExam(examDTO: any, examId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(examDTO),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/exam/updateExam/${examId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateExam');
    }
    return jsonRes;
  }

  public async removeExam(examId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/exam/removeExam/${examId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeExam');
    }
    return jsonRes;
  }

  public async removeJob(jobOfferId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/removeJobOffer/${jobOfferId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeJob');
    }
    return jsonRes;
  }

  public async removeTest(quizId: number, testId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/quiz/removeTest/${testId}/${quizId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeTest');
    }
    return jsonRes;
  }

  public async removeQuiz(quizId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/quiz/removeQuiz/${quizId}`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeQuiz');
    }
    return jsonRes;
  }

  public async resetQuizTestsPoints(quizId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(`${this.BASE_URL}/quiz/resetQuizTestsPoints/${quizId}`, opts);
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not resetQuizTestsPoints');
    }
    return jsonRes;
  }

  public async getCandidateData(userId: number, jobOfferId: number) {
    const response = await fetch(
      `${this.BASE_URL}/jobOffer/getUserData/${userId}/${jobOfferId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getJobOfferUserData');
    }
    return jsonRes;
  }

  public async getUserTestsImages(userId: number, examId: number) {
    const response = await fetch(
      `${this.BASE_URL}/userApplication/exam/getUserTestsImages/${userId}/${examId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserTestsImages');
    }
    return jsonRes;
  }

  public async getBusinessReservations(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/reservation/getBusinessReservations/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessReservations');
    }
    return jsonRes;
  }

  public async getUserDiscounts() {
    const response = await fetch(
      `${this.BASE_URL}/userDiscount/getUserDiscounts`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserDiscounts');
    }
    return jsonRes;
  }

  public async getUserFidelityCards() {
    const response = await fetch(
      `${this.BASE_URL}/userFidelityCard/getUserFidelityCards`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserFidelityCards');
    }
    return jsonRes;
  }

  public async getUserBusinessesList(userId: number) {
    const response = await fetch(
      `${this.BASE_URL}/business/getUserBusinessesList/${userId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserBusinessesList');
    }
    return jsonRes;
  }

  public async createNewBusiness(dto: any) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/business/addBusiness`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewBusiness');
    }
    return jsonRes;
  }

  public async updateBusiness(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/business/updateBusiness/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateBusiness');
    }
    return jsonRes;
  }

  public async getUserBusiness(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/business/getBusiness/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserBusiness');
    }
    return jsonRes;
  }

  public async getBusinessDiscounts(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/businessDiscount/getBusinessDiscounts/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessDiscounts');
    }
    return jsonRes;
  }

  public async createNewBusinessDiscount(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessDiscount/addBusinessDiscount/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createNewBusinessDiscount');
    }
    return jsonRes;
  }

  public async getBusinessDiscount(discountId: number) {
    const response = await fetch(
      `${this.BASE_URL}/businessDiscount/getBusinessDiscount/${discountId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessDiscount');
    }
    return jsonRes;
  }

  public async updateBusinessDiscount(dto: any, discountId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessDiscount/updateBusinessDiscount/${discountId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateBusinessDiscount');
    }
    return jsonRes;
  }

  public async getBusinessFidelityCard(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/businessFidelityCard/getBusinessFidelityCard/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessFidelityCard');
    }
    return jsonRes;
  }

  public async updateBusinessFidelityCard(dto: any, fidelityCardId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessFidelityCard/updateBusinessFidelityCard/${fidelityCardId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateBusinessFidelityCard');
    }
    return jsonRes;
  }

  public async createBusinessFidelityCard(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessFidelityCard/addBusinessFidelityCard/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not createBusinessFidelityCard');
    }
    return jsonRes;
  }

  public async getBusinessReviews(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/userReview/getBusinessReviews/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessReviews');
    }
    return jsonRes;
  }

  public async getBusinessSocialPosts(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/userSocialPost/getBusinessSocialPosts/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getBusinessSocialPosts');
    }
    return jsonRes;
  }

  public async getLastAppVersion() {
    const response = await fetch(
      `${this.BASE_URL}/auth/appVersion`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getLastAppVersion');
    }
    return jsonRes;
  }

  public async discardSocialPost(userSocialPostId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userSocialPost/discardSocialPost/${userSocialPostId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not discardSocialPost');
    }
    return jsonRes;
  }

  public async approveSocialPost(userSocialPostId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userSocialPost/approveSocialPost/${userSocialPostId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not approveSocialPost');
    }
    return jsonRes;
  }

  public async addUserFidelityCard(businessId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userFidelityCard/addUserFidelityCard/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addUserFidelityCard');
    }
    return jsonRes;
  }

  public async sendSocialPost(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userSocialPost/sendSocialPost/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not sendSocialPost');
    }
    return jsonRes;
  }

  public async addBusinessReview(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userReview/addBusinessReview/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addBusinessReview');
    }
    return jsonRes;
  }

  public async checkUserDiscountValidity(userDiscountId: number, businessId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessDiscount/checkUserDiscountValidity/${userDiscountId}/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not checkUserDiscountValidity');
    }
    return jsonRes;
  }

  public async checkUserFidelityCardValidity(userFidelityCardId: number, businessId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/businessFidelityCard/checkUserFidelityCardValidity/${userFidelityCardId}/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not checkUserFidelityCardValidity');
    }
    return jsonRes;
  }

  public async addUserReservation(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/reservation/addReservation/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addUserReservation');
    }
    return jsonRes;
  }

  public async updateBusinessReservation(dto: any, resId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/reservation/updateBusinessReservation/${resId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not updateBusinessReservation');
    }
    return jsonRes;
  }

  public async getReservation(reservationId: number) {
    const response = await fetch(
      `${this.BASE_URL}/reservation/getReservation/${reservationId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getReservation');
    }
    return jsonRes;
  }

  public async getUserReservations() {
    const response = await fetch(
      `${this.BASE_URL}/reservation/getUserReservations`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserReservations');
    }
    return jsonRes;
  }

  public async getUserReferral(businessId: number, userId: number) {
    const response = await fetch(
      `${this.BASE_URL}/userReferral/getUserReferral/${userId}/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserReferral');
    }
    return jsonRes;
  }

  public async generateUserReferral(businessId: number, userId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userReferral/generateUserReferral/${userId}/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not generateUserReferral');
    }
    return jsonRes;
  }

  public async generateUserDiscountFromReferral(uuid: string) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/userReferral/generateUserDiscountFromReferral/${uuid}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not generateUserDiscountFromReferral');
    }
    return jsonRes;
  }

  public async getBusinessEmployees(businessId: number) {
    const response = await fetch(
      `${this.BASE_URL}/business/getUserBusinesses/${businessId}`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getUserBusinesses');
    }
    return jsonRes;
  }

  public async removeUserBusiness(businessId: number, userId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/business/removeUserBusiness/${businessId}/${userId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not removeUserBusiness');
    }
    return jsonRes;
  }

  public async addUserBusiness(businessId: number, userId: number) {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/business/addUserBusiness/${businessId}/${userId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not addUserBusiness');
    }
    return jsonRes;
  }

  public async getLoggedUser() {
    const response = await fetch(
      `${this.BASE_URL}/user/getLoggedUser`,
      { headers: this.getHeaders() }
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not getLoggedUser');
    }
    return jsonRes;
  }

  public async deleteUser() {
    const opts = {
      method: 'POST',
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/user/deleteUser`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not deleteUser');
    }
    return jsonRes;
  }

  public async sendNotificationToClients(dto: any, businessId: number) {
    const opts = {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: this.getHeaders(),
    };
    const response = await fetch(
      `${this.BASE_URL}/business/sendNotificationToClients/${businessId}`,
      opts
    );
    const jsonRes = await response.json();
    if (!response.ok || (response.status >= 400 && response.status <= 500)) {
      throw new Error(jsonRes?.message || 'Could not sendNotificationToClients');
    }
    return jsonRes;
  }
}

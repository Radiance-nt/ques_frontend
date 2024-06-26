<!--TODO: 必选，不为空（如果item["required"]为True）-->

<template>
  <div class="header">
    <button @click="sendPostRequest(1)" class="nav-button">Tutorial</button>
    <button @click="sendPostRequest(2)" class="nav-button">Survey</button>
    <button @click="sendPostRequest(3)" class="nav-button">Open Question</button>

    <div v-if="!isLoggedIn" class="login-container">
      <input v-model="inputUsername" type="text" placeholder="Enter your email address"/>
      <button @click="login" class="login-button">Login</button>
    </div>

    <div v-else class="username-bar">
      <span class="username">Welcome, {{ username }}</span>
      <button @click="logout" class="logout-button">Logout</button>
    </div>
  </div>

  <div class="message-bar">
    <span class="message">{{ message }}</span>
  </div>

  <div id="app">
    <!--    <div class="vertical-space"></div>-->
    <div class="content-wrapper">
      <div v-for="(item, index) in contentList" :key="index" class="content-box">
        <div v-if="item.type === 1" v-html="markdownToHtml(item.content)" class="markdown"></div>
        <div v-else-if="item.type === 2" class="video-text-wrapper">
          <div v-html="markdownToHtml(item.content.text)" class="markdown"></div>
          <div class="video-wrapper">
            <video :src="item.content.path" controls></video>
          </div>
        </div>
        <div v-else-if="item.type === 11" class="survey">
          <div v-html="markdownToHtml(item.content.question)" class="markdown"></div>
          <div v-for="(option, idx) in item.content.options" :key="idx" class="option">
            <input type="radio" :id="`option-${index}-${idx}`" :value="option" v-model="item.content.answer"
                   :required="item.required">
            <label :for="`option-${index}-${idx}`" @click.prevent>{{ option }}</label>
          </div>
        </div>

        <div v-else-if="item.type === 12" class="survey">
          <div v-html="markdownToHtml(item.content.question)" class="markdown"></div>
          <div v-for="(option, idx) in item.content.options" :key="idx" class="option">
            <input type="checkbox" :id="'option-' + index + '-' + idx" v-model="item.content.answer[idx]">
            <label :for="'option-' + index + '-' + idx">{{ option }}</label>
          </div>
          <div class="other-option">
            <input type="checkbox" :id="'option-' + index + '-others'" v-model="item.content.otherChecked">
            <label :for="'option-' + index + '-others'">Others</label>
            <input type="text" v-model="item.content.others" :disabled="!item.content.otherChecked"
                   placeholder="Please specify" :required="item.required && item.content.otherChecked">
          </div>
        </div>

        <div v-else-if="item.type === 13" class="survey">
          <div v-html="markdownToHtml(item.content.question)" class="markdown"></div>
          <textarea v-model="item.content.answer" class="text-input" :required="item.required"></textarea>
        </div>

        <div v-else-if="item.type === TYPE_SUBMIT_BUTTON" class="button-wrapper">
          <button @click="submitResults" class="fetch-button">{{ item.content }}</button>
        </div>
      </div>
    </div>

    <div class="vertical-space"></div>
    <div class="button-wrapper">
      <button @click="fetchContent" class="fetch-button">Fetch Content</button>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import {marked} from 'marked';
import {useRoute} from 'vue-router';

import {getUser, login, logout} from './auth';


const TYPE_SUBMIT_BUTTON = 99;

export default {
  name: 'App',
  data() {
    return {
      username: getUser() || 'Guest',
      contentList: [],
      baseUrl: process.env.VUE_APP_API_BASE_URL,
      TYPE_SUBMIT_BUTTON: 99,
      inputUsername: '',
      message: ''
    };
  },
  computed: {
    isLoggedIn() {
      return !!getUser();
    }
  },
  setup() {
    const route = useRoute();

    return {
      route
    }
  },
  created() {
    this.username = getUser() || 'Guest';
    this.fetchMessage();
  },

  beforeRouteEnter(to, from, next) {
    console.log("Current route path:", to.path);
    next(vm => {
      vm.fetchContent();
    });
  },
  methods: {
    markdownToHtml(markdown) {
      return marked(markdown);
    },

    fetchMessage() {
      const postUrl = `${process.env.VUE_APP_API_BASE_URL}/api/bubble`;
      const data = {
        username: this.username,
        mode: this.route.path,
      };

      axios.post(postUrl, data)
          .then(response => {
            this.message = response.data.message;
          })
          .catch(error => {
            console.error('Error fetching message:', error);
          });
    },
    fetchContent() {

      if ((!this.isLoggedIn) && ((this.route.path === '/survey' || this.route.path === '/general'))) {
        this.contentList.push({
          type: 1,
          content: '### Please login first!'
        });
        return;
      }
      let apiUrl;
      switch (this.route.path) {
        case '/tutorial':
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/api/get_tutorial_content`; // 正确使用baseUrl
          break;
        case '/survey':
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/api/get_survey_content`; // 正确使用baseUrl
          break;
        case '/general':
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/api/get_general_content`; // 正确使用baseUrl
          break;
        default:
          console.error('Invalid path');
          return;
      }

      axios.post(apiUrl, {username: this.username})
          .then(response => {
            this.contentList = response.data;
            // if (this.route.path === '/survey' || this.route.path === '/general') {
            //   this.contentList.push({
            //     type: TYPE_SUBMIT_BUTTON,
            //     content: "Submit Results"
            //   });
            // }
          })
          .catch(error => {
            console.error('Error fetching content:', error);
          });
    },
    login() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.inputUsername)) {
        this.message = "Please enter a valid email address.";
        return;
      }
      login(this.inputUsername);
      this.username = this.inputUsername;
      this.inputUsername = '';
      this.refreshPage();
    },
    logout() {
      logout();
      this.username = 'Guest';
      this.refreshPage();
    },
    refreshPage() {
      window.location.reload();
    },
    submitResults() {
      for (let item of this.contentList) {
        console.info('Item:', item.content.answer);
        console.info('Item required:', item.content.required);

        if (item.content.required) {
          if (item.type === 11 || item.type === 13) {
            if (!item.content.answer) {
              alert("Please fill in all required fields.");
              return;
            }
          } else if (item.type === 12) {
            const hasChecked = item.content.answer.includes(true) || (item.content.otherChecked && item.content.others.trim() !== '');
            if (!hasChecked) {
              alert("Please fill in all required fields.");
              return;
            }
          }
        }
      }
      const submitUrl = `${process.env.VUE_APP_API_BASE_URL}/api/submit_results`;
      const submissionData = {
        results: this.contentList,
        username: this.username,
        mode: this.route.path,
      };

      axios.post(submitUrl, submissionData)
          .then(response => {
            if (response.status === 200) {
              this.removeSubmitButton();
              if (this.route.path === '/survey') {
                this.contentList.push({
                  type: 1,
                  content: '## Results submitted successfully! \n## Loading the next evaluation...'
                });
                setTimeout(() => {
                  this.contentList = [];
                  this.fetchMessage();
                  this.fetchContent();
                }, 3000);
              } else if (this.route.path === '/general') {
                this.fetchMessage();
                this.contentList.push({
                  type: 1,
                  content: '## Results submitted successfully! \n## Thank you for your participation.'
                });
              }
            }
          })
          .catch(error => {
            console.error('Error submitting results:', error);
          });
    },


    removeSubmitButton() {
      const submitButtonIndex = this.contentList.findIndex(item => item.type === TYPE_SUBMIT_BUTTON);
      if (submitButtonIndex !== -1) {
        this.contentList.splice(submitButtonIndex, 1);
      }
    },
    sendPostRequest(buttonNumber) {
      const postUrl = `${process.env.VUE_APP_API_BASE_URL}/api/direct`;
      const data = {
        buttonNumber,
      };
      axios.post(postUrl, data)
          .then(response => {
            const redirectUrl = response.data.redirectUrl;
            window.location.href = redirectUrl;
          })
          .catch(error => {
            console.error('Error sending POST request:', error);
          });
    }
    ,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 80px auto 80px;
  max-width: 1000px;
}

.content-wrapper {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
}

.content-box {
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.markdown {
  text-align: left;
}

.video-wrapper {
  display: flex;
  justify-content: center;
  max-width: 100%;
}

.video-wrapper video {
  max-width: 100%;
  height: auto;
}

.survey h3 {
  margin-top: 0;
}

.option {
  margin-bottom: 10px;
}

.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.button-wrapper {
  margin-top: 20px;
  text-align: center;
}

.fetch-button {
  background-color: #42b983;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.fetch-button:hover {
  background-color: #2c3e50;
}


.nav-button {
  width: 180px; /* 设置按钮宽度为 120 像素 */
  background-color: #3498db;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 50px;
}

.nav-button:hover {
  background-color: #2980b9;
}


.button-wrapper {
  justify-content: space-between;
}

.fetch-button:last-child {
  margin-right: 0;
}

.vertical-space {
  height: 60px;
}

/* 增大单选框和多选框的样式 */
input[type="radio"], input[type="checkbox"] {
  /* 调整宽度和高度 */
  width: 20px;
  height: 20px;
  /* 可选：增加边界使点击更容易 */
  margin: 10px;
  /* 可选：自定义外观 */
  cursor: pointer;
}

/* 标签的样式也可以相应调整，以匹配更大的输入框 */
.option label {
  font-size: 16px; /* 调整字体大小 */
  line-height: 24px; /* 调整行高以垂直居中文本 */
  cursor: pointer; /* 改进用户交互体验 */
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  position: fixed; /* 将用户名条固定在页面顶部 */
  top: 0;
  left: 0;
  right: 0;
}

.username-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.username {
  margin-right: 10px;
  font-weight: bold;
}

.logout-button {
  background-color: #ff4d4d;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #cc0000;
}

.login-container {
  display: flex;
  align-items: center;
  margin-right: 20px;
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-container input {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.login-button {
  background-color: #42b983;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #2c3e50;
}

.message-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 20px;
  top: 10px;
  left: 0;
  right: 0;
  z-index: 500;
}

.message {
  font-weight: bold;
  color: #2c3e50;
}

</style>
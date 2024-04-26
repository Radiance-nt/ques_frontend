<template>
  <div class="header">
    <button @click="sendPostRequest(1)" class="nav-button">Tutorial</button>
    <button @click="sendPostRequest(2)" class="nav-button">Survey</button>
    <button @click="sendPostRequest(3)" class="nav-button">Open Question</button>

    <div v-if="!isLoggedIn" class="login-container">
      <input v-model="inputUsername" type="text" placeholder="Enter your username"/>
      <button @click="login" class="login-button">Login</button>
    </div>

    <div v-else class="username-bar">
      <span class="username">Welcome, {{ username }}</span>
      <button @click="logout" class="logout-button">Logout</button>
    </div>
  </div>

  <div id="app">
    <div class="vertical-space"></div>
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
            <input type="radio" :id="'option' + idx" :value="option" v-model="item.content.answer">
            <label :for="'option' + idx">{{ option }}</label>
          </div>
        </div>
        <div v-else-if="item.type === 12" class="survey">
          <div v-html="markdownToHtml(item.content.question)" class="markdown"></div>
          <div v-for="(option, idx) in item.content.options" :key="idx" class="option">
            <input type="checkbox" :id="'option' + idx" :value="option">
            <label :for="'option' + idx">{{ option }}</label>
          </div>
          <div class="other-option">
            <input type="checkbox" id="otherOption" value="other">
            <label for="otherOption">Others</label>
            <input type="text" v-model="otherValue" placeholder="">
          </div>
        </div>

        <div v-else-if="item.type === 13" class="survey">
          <div v-html="markdownToHtml(item.content.question)" class="markdown"></div>
          <textarea v-model="item.content.answer" class="text-input"></textarea>
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
      TYPE_SUBMIT_BUTTON: 99,
      inputUsername: ''
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
    fetchContent() {
      console.log("fetchContent");
      let apiUrl;
      switch (this.route.path) {
        case '/tutorial':
          apiUrl = 'http://localhost:5000/api/get_tutorial_content';
          break;
        case '/survey':
          apiUrl = 'http://localhost:5000/api/get_survey_content';
          break;
        case '/general':
          apiUrl = 'http://localhost:5000/api/get_general_content';
          break;
        default:
          console.error('Invalid path');
          return;
      }

      axios.get(apiUrl)
          .then(response => {
            this.contentList = response.data;
            if (this.route.path === '/survey' || this.route.path === '/general') {
              this.contentList.push({
                type: TYPE_SUBMIT_BUTTON, // 确保TYPE_SUBMIT_BUTTON已经定义
                content: "Submit Results"
              });
            }
          })
          .catch(error => {
            console.error('Error fetching content:', error);
          });
    },
    login() {
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
      const submitUrl = 'http://localhost:5000/api/submit_results';
      axios.post(submitUrl, {results: this.contentList})
          .then(response => {
            if (response.status === 200) {
              if (this.route.path === '/survey') {
                this.contentList.push({
                  type: 1,
                  content: '## Results submitted successfully! $\n## Loading the next evaluation...'
                });
                setTimeout(() => {
                  this.contentList = [];
                  this.fetchContent();
                }, 3000);
              } else if (this.route.path === '/general') {
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
    }
    ,


    sendPostRequest(buttonNumber) {
      const postUrl = 'http://localhost:5000/api/direct';
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
  margin: 80px auto 100px;
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
  z-index: 999; /* 确保用户名条位于其他内容之上 */
}

.username-bar {
  display: flex;
  align-items: center;
  justify-content: center; /* 添加这一行 */
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 其他样式保持不变 */

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
</style>
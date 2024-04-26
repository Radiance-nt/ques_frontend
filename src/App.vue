<template>
  <div id="app">
    <div class="content-wrapper">
      <div v-for="(item, index) in contentList" :key="index" class="content-box">
        <div v-if="item.type === 1" v-html="markdownToHtml(item.content)" class="markdown"></div>
        <div v-else-if="item.type === 2" class="video-wrapper">
          <video :src="item.content" controls></video>
        </div>
        <div v-else-if="item.type === 11" class="survey">
          <h3>{{ item.content.question }}</h3>
          <div v-for="(option, idx) in item.content.options" :key="idx" class="option">
            <input type="radio" :id="'option' + idx" :value="option" v-model="item.content.answer">
            <label :for="'option' + idx">{{ option }}</label>
          </div>
        </div>
        <div v-else-if="item.type === 12" class="survey">
          <h3>{{ item.content.question }}</h3>
          <div v-for="(option, idx) in item.content.options" :key="idx" class="option">
            <input type="checkbox" :id="'option' + idx" :value="option" v-model="item.content.answer">
            <label :for="'option' + idx">{{ option }}</label>
          </div>
        </div>
        <div v-else-if="item.type === 13" class="survey">
          <h3>{{ item.content.question }}</h3>
          <textarea v-model="item.content.answer" class="text-input"></textarea>
        </div>
      </div>
    </div>
    <div class="button-wrapper">
      <!--      <button @click="fetchContent" class="fetch-button">Fetch Content</button>-->
      <button @click="sendPostRequest(1)" class="fetch-button">Tutorial</button>
      <button @click="sendPostRequest(2)" class="fetch-button">Survey</button>
      <button @click="sendPostRequest(3)" class="fetch-button">Open Question</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {marked} from 'marked';
import {useRoute} from 'vue-router';

export default {
  name: 'App',
  data() {
    return {
      contentList: []
    };
  },
  setup() {
    const route = useRoute();

    return {
      route
    }
  },
  methods: {
    markdownToHtml(markdown) {
      return marked(markdown);
    },
    fetchContent() {
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
            response.data.forEach(item => {
              this.contentList.push(item);
            });
          })
          .catch(error => {
            console.error('Error fetching content:', error);
          });
    },
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
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 60px auto;
  max-width: 800px;
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

.button-wrapper {
  justify-content: space-between;
}

.fetch-button {
  margin-right: 50px;
}

.fetch-button:last-child {
  margin-right: 0;
}


</style>
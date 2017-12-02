<template>
  <div id="app">
    <div v-if="admin">
        <div class="container">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Add new team
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                <table>
                  <tr>
                    <td>Name:</td>
                    <td><input class="input" type="text" v-model="team_name" placeholder="Team name"></td>
                  </tr>
                  <tr>
                    <td>Repository Url:</td>
                    <td><input class="input" type="text" v-model="repository_url" placeholder="Repository URL (SSH)"></td>
                  </tr>
                  <tr>
                    <td colspan="2"><button class="button" :disabled="loading" @click="saveTeam(team_name, repository_url)">Save</button></td>
                  </tr>
                </table>
              </div>
              </div>
            </div>
          </div>
        <div>
          
        <div class="container">
          <table class="table">
            <thead>
              <tr>
                <th>Team name</th>
                <th>Repository</th>
                <th>Progress</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in teams">
                <td>{{ team.team_name }}</td>
                <td><a :href="team.repository_url" target="_blank">{{ team.repository_url }}</a></td>
                <td>{{ team.stage }}</td>
                <td>{{ lastUpdate(team.updated) }} ago</td>
                <td><button class="button" :disabled="loading" @click="deleteTeam(team.repository_url)">DELETE</button></td>
              </tr>
            </tbody>
          </table>
          </div>
      </div>
    </div>
    <div v-if="!admin">
      <div class="container">
        <table class="table">
          <thead>
            <tr>
              <th>Team name</th>
              <th>Progress</th>
              <th>Console</th>
              <th v-if="!cons">Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams">
              <td>{{ team.team_name }}</td>
              <td>{{ team.stage }}</td>
              <td v-if="!cons"><button @click="openConsole(team.repository_url)" class="button">View console</button></td>
              <td v-if="cons"><pre v-html="team.console"></pre><p class="small">Updated {{ lastUpdate(team.updated) }} ago.</p></td>
              <td v-if="!cons">{{ lastUpdate(team.updated) }} ago</td>
            </tr>
          </tbody>
      </table>
      </div>
    </div>
    
  </div>
</template>

<script>
/* global axios */
import HttpConfig from './configs/HttpConfig.js';
import axios from 'axios';

export default {
  name: 'app',
  data () {
    return {
      teams: [],
      error: false,
      admin: false,
      team_name: '',
      repository_url: '',
      loading: false,
      cons: false
    };
  },
  methods: {
    getURLParameter(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    },
    openConsole(repository_url) {
      this.cons = repository_url;
      this.updateTeams();
    },
    isAdmin() {
      const admin = this.getURLParameter('admin');
      if (admin == 'git') {
        this.admin = true;
      }
    },
    updateTeams() {
      this.error = false;
      axios.get(HttpConfig.baseUrl + '/team').then(res => {
        if (res.data.success) {
          if (this.cons !== false) {
            this.teams = res.data.data.filter(team => {
              return team.repository_url == this.cons
            });
          } else {
            this.teams = res.data.data;  
          }
        } else {
          this.error = true;
        }
      });
    },
    saveTeam(team_name, repository_url) {
      this.loading = true;
      this.error = false;
      axios.post(HttpConfig.baseUrl + '/team/new', { team_name, repository_url })
        .then(res => {
          this.loading = false;
          if (res.data.success) {
            this.team_name = '';
            this.repository_url = '';
            this.updateTeams();
          } else {
            this.error = true;
          }
        });
    },
    deleteTeam(repository_url) {
      this.loading = true;
      this.error = false;
      axios.delete(HttpConfig.baseUrl + '/team', { data: { repository_url } })
        .then(res => {
          this.loading = false;
          if (res.data.success) {
            this.updateTeams();
          } else {
            this.error = true;
          }
        });
    },
    lastUpdate(time) {
      const diff = Math.floor(Date.now() / 1000) - parseInt(time);
      if (diff == 1) return diff + ' second';
      if (diff < 60) return diff + ' seconds';
      if (diff >= 60 && diff < 120) return Math.floor(diff/60) + ' minute';
      if (diff >= 120) return Math.floor(diff/60) + ' minutes';
      if (diff >= 3600 && diff < 7200) return Math.floor(diff/3600) + ' hour';
      if (diff >= 7200) return Math.floor(diff/3600) + ' hours';
    }
  },
  mounted() {
    this.isAdmin();
    this.updateTeams();
    
    setInterval(this.updateTeams, 5000);
  }
};
</script>

<style>
body {
  padding: 30px;
}
.container {
  margin-bottom: 50px;
}
table {
  width: 100%;
}
.small {
  margin-top: 20px;
  font-size: 12px;
}

.error {
  color: red;
}

.success {
  color: green;
}

pre p {
  font-weight: bold;
  margin-bottom: 1.5rem;
}

pre {
  max-height: 400px;
  overflow-y: auto;
}
</style>

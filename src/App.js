import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes, geniusToken } from "config";
import hash from "./hash";
import Player from "./Player";
//import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      lyrics: null,
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0,
      lyrics_path: "",
      lyricsSrc: null,
      progress_percent: 0
    };
    this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    // this.getLyrics = this.getLyrics.bind(this);
  }



  getLyrics2(geniusToken){

    $.ajax({
      url: "https://api.genius.com/search?q=" + this.state.item.name+' '+this.state.item.artists[0].name,
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + geniusToken);
      },
      success: data => {
        console.log(data.response);
        this.setState({
          lyrics_path: data.response.hits[0].result.path
        });
      }
  });

  $.ajax({
    url: "https://api.genius.com/songs/66570",//+this.state.lyrics_path,
    type: "GET",
    beforeSend: xhr => {
      xhr.setRequestHeader("Authorization", "Bearer " + geniusToken);
    },
    success: data => {
      this.setState({
        lyrics: data.response
      });
    }
  });
}


  componentDidMount() {
    // Set token
    let _token = hash.access_token;
    //let gentoken = geniusToken;
    var intervalId = setInterval(this.getCurrentlyPlaying, 5000);
    var intervalId2 = setInterval(this.getLyrics, 5000);

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      this.getCurrentlyPlaying(_token);
      this.getLyrics();
      //this.setState({intervalId: this.getCurrentlyPlaying});
    }
  }


  // getLyrics() {
  //   // Make a call using the token
  //   console.log("azlyrics request about to run")
  //   //fetch("https://ww.azlyrics.com/lyrics/" + this.state.item.artists[0].name.toLowerCase() + "/" + this.state.item.name.toLowerCase() + ".html")
  //   fetch("https://www.azlyrics.com/lyrics/avettbrothers/iandloveandyou.html")
  //   .then(response => {
  //     this.setState({
  //       lyrics: response.data
  //     })
  //   .catch(err => console.log(err.message))
  //   // after request
  //   console.log("semisuccessful azlyrics request");
  // })

  getLyrics = async () => {
    const artist = this.state.item.artists[0].name.replace(/ *\([^)]*\) */g, "").toLowerCase().replace(/[^a-z]/gi, '');
    const songName = this.state.item.name.replace(/ *\([^)]*\) */g, "").toLowerCase().replace(/[^a-z]/gi, '')
    this.setState({
      lyrics: `https://www.azlyrics.com/lyrics/${artist}/${songName}.html`
      });
    try {
      const response = await fetch("https://www.azlyrics.com/lyrics/avettbrothers/iandloveandyou.html", {credentials: 'same-origin'});
      this.setState({
        lyrics: response.data
      })
    } catch (err) {
      console.log("fetch error")
      console.log(err.message)
    }
  }

    // $.ajax({
    //   url: "https://www.azlyrics.com/lyrics/avettbrothers/iandloveandyou.html",
    //   type: "GET",
    //   // beforeSend: xhr => {
    //   //   xhr.setRequestHeader("Authorization", "Bearer " + token);
    //   // },
    //   success: data => {
    //     this.setState({
    //       lyrics: data.response
    //     });
    //   }
    // });

  getCurrentlyPlaying() {
    // Make a call using the token
    if (this.state.token){
      $.ajax({
        url: "https://api.spotify.com/v1/me/player",
        type: "GET",
        beforeSend: xhr => {
          xhr.setRequestHeader("Authorization", "Bearer " + this.state.token);
        },
        success: data => {
          this.setState({
            item: data.item,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms,
            progress_percent: Math.round(data.progress_ms*100 / data.item.duration_ms)
          });
        }
      });
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}
          {this.state.token && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.progress_ms}
              lyrics={this.state.lyrics}
            />
          )}
        </header>
      </div>
    );
  }
}

export default App;

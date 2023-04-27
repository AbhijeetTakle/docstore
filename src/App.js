import "./App.css";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import CLIENT_ID from "./utils";

function App() {
  const [user, setUser] = useState();
  const [file, setFile] = useState();
  const [docs, setDocs] = useState();

  function handleCallbackResponse(response) {
    const usr = jwtDecode(response.credential);
    setUser(usr);
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse,
    });
    google.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      size: "large",
    });
  }, []);

  useEffect(() => {
    function getDocuments() {
      if (user !== undefined) {
        fetch(`http://localhost:5000/docs/${user.email}`, {
          method: "GET",
        })
          .then((res) => res.json())
          .then((response) => {
            setDocs(response.docs);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
    getDocuments();
  }, [user]);

  useEffect(() => {
    const signin = document.getElementById("signInDiv");
    signin.setAttribute("display", "none");

    if (user !== undefined) {
      let formdata = new FormData();
      const data = JSON.stringify({
        email: user.email,
      });
      formdata.append("email", user.email);

      fetch("http://localhost:5000/user", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: data,
      })
        .then((res) => res.json())
        .then((response) => {})
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let formdata = new FormData();
    formdata.append("file", file);
    formdata.append("email", user.email);

    fetch("http://localhost:5000/files", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.json())
      .then((response) => {
        setDocs([...docs, response]);
        e.target.reset();
        setFile(undefined);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="App">
      <div
        id="signInDiv"
        style={{
          display: user === undefined ? "block" : "none",
        }}
      ></div>
      <div
        id="mainpage"
        style={{
          display: user === undefined ? "none" : "block",
        }}
      >
        <form onSubmit={handleSubmit}>
          <input
            id="choosefile"
            type="file"
            onChange={handleFileChange}
          ></input>
          <input id="submitbtn" type="submit"></input>
        </form>
        <div id="alldocs">
          {docs === undefined
            ? ""
            : docs.map((doc, idx) => {
                return (
                  <a className="listitem" href={doc.link} key={idx}>
                    {doc.name}
                  </a>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";

const UPLOAD_URL = new URL("https://85jb2c1q5e.execute-api.ap-southeast-2.amazonaws.com/live/gifs/create");
const BUCKET_NAME = "gifbucket-sudojosh";
const AWS_REGION = "ap-southeast-2";

const bucketUrl = () => `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;
const publicObjectUrl = (key) => `${bucketUrl()}/${key}`;


class Index extends React.Component {
  state = { isLoading: true, items: [] }
  componentDidMount() {
    fetch(bucketUrl())
      .then(r => r.text())
      .then(xml => (new window.DOMParser()).parseFromString(xml, "text/xml"))
      .then(doc => Array.from(doc.querySelectorAll("Contents")))
      .then(elements => (
        elements.map(content => (
          Array.from(content.children).reduce(
            (acc, child) => {
              acc[child.tagName.toLowerCase()] = child.textContent; return acc;
            }, {}
          )
        ))
      ))
      .then(contents => this.setState({ items: contents, isLoading: false }));
  }
  render() {
    const { isLoading, items } = this.state;
    if (isLoading) return <p>Loading...</p>;
    return (
      <ul className="ItemList">
        {items.map(item => <li key={item.key}><img src={publicObjectUrl(item.key)} alt={item.key} /></li>)}
      </ul>
    );
  }
}

class ShareTarget extends React.Component {
  constructor(props) {
    super(props);
    const params = new URLSearchParams(props.location.search); // From react-router
    this.requestUpload = this.requestUpload.bind(this);
    this.state = { url: params.get("url") || params.get("text") };
  }

  requestUpload(evt) {
    evt.preventDefault();
    this.setState({ isLoading: true });
    UPLOAD_URL.searchParams.append("url", this.state.url);
    fetch(UPLOAD_URL, { method: "POST", headers: { "X-Api-Key": "test" } })
      .then(() => this.props.history.push("/"), alert);
  }

  render() {
    return <div className="ShareTarget">
      <img src={this.state.url} alt={this.state.url} />
      <button className="UploadButton" onClick={this.requestUpload} disabled={this.state.isLoading}>
        {this.state.isLoading ? "Bucketing..." : "Add to Bucket"}</button>
      <Link className="CancelLink" to="/">Cancel</Link>
    </div>
  }
}
function AppRouter() {
  return (
    <Router>
      <header className="Header">
        <h1 className="Header--Title">GIFBucket</h1>
      </header>
      <Route path="/" exact component={Index} />
      <Route path="/share-target/" component={ShareTarget} />
    </Router>
  );
}

export default AppRouter;
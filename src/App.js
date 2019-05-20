import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";

const UPLOAD_URL = new URL(process.env.REACT_APP_API_ENDPOINT + "/gifs/create");
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const AWS_REGION = process.env.REACT_APP_S3_REGION;

const bucketUrl = () => `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;

const Item = ({ item, isActive, onClick }) => {
  const publicUrl = `${bucketUrl()}/${item.key}`;
  // Gross, but we don't get the content-type back from AWS
  const mediaElement = publicUrl.endsWith(".mp4") ?
    <video autoPlay muted loop src={publicUrl} />
    :
    <img src={publicUrl} alt={item.key} />;
  return (
    <li
      className={`Item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {mediaElement}
      <div className="Share">
        <button
          onClick={(evt) => { if (!navigator.share) return; evt.preventDefault(); navigator.share({ url: publicUrl }) }}
        >Share</button>
      </div>
    </li >
  );
}


class Index extends React.Component {
  state = { isLoading: true, items: [] }
  constructor(props) {
    super(props);
    this.setActive = this.setActive.bind(this);
  }
  componentDidMount() {
    fetch(bucketUrl())
      .then(r => r.text())
      .then(xml => (new window.DOMParser()).parseFromString(xml, "text/xml"))
      .then(doc => Array.from(doc.querySelectorAll("Contents")))
      .then(elements => (
        elements.map(content => (
          Array.from(content.children).reduce(
            (acc, child) => {
              acc[child.tagName.toLowerCase()] = child.textContent;
              return acc;
            }, {}
          )
        ))
      ))
      .then(contents => this.setState({ items: contents, isLoading: false }));
  }
  setActive(evt) {
    evt.preventDefault();

  }
  render() {
    const { isLoading, items, active } = this.state;
    if (isLoading) return <p>Loading...</p>;
    return (
      <ul className="ItemList">
        {items.map(item => (
          <Item
            item={item}
            key={item.key}
            isActive={active === item.key}
            onClick={e => {
              e.preventDefault();
              this.setState({ active: active === item.key ? null : item.key })
            }} />
        ))}
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
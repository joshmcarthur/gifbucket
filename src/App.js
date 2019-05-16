import React from "react";
import Uppy from "@uppy/core";
import { Dashboard } from '@uppy/react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AWS from "aws-sdk";
import AwsS3 from "@uppy/aws-s3";
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/url/dist/style.css'

AWS.config.update({
  region: "ap-southeast-2",
  accessKeyId: "abc123",
  secretAccessKey: "abc123"
});

const s3 = new AWS.S3({ params: { Bucket: "sudojosh-gifbucket" } });

function Index() {
  return <h2>Home</h2>;
}

class ShareTarget extends React.Component {
  constructor(props) {
    super(props);
    const params = new URLSearchParams(props.location.search); // From react-router
    const sharedUrl = params.get("url") || params.get("text");

    this.uppy = Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: ['image/*', 'video/*']
      }
    });

    this.uppy.use(AwsS3, {
      getUploadParameters(file) {
        const params = {
          Key:
        }
        return s3.getSignedUrl("putObject")
        AWS.S3.p

        return {
          method: data.method,
          url: data.url,
          fields: data.fields
        }
      }
    });


    if (sharedUrl && sharedUrl.startsWith("http")) {
      fetch(sharedUrl)
        .then(r => r.blob())
        .then(file => {
          const filename = new Date().toString();
          this.uppy.addFile({
            name: filename,
            type: file.type,
            size: file.size,
            data: file,
            source: 'URL',
            isRemote: false
          });
        });
    }
  }
  componentWillUnmount() {
    this.uppy.close()
  }
  render() {
    return <Dashboard plugins={['Url']} uppy={this.uppy} />
  }
}
function AppRouter() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/create/">Create</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={Index} />
        <Route path="/share-target/" component={ShareTarget} />
      </div>
    </Router>
  );
}

export default AppRouter;
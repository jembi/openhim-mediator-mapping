/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import Layout from '@theme/Layout'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Link from '@docusaurus/Link'
import useBaseUrl from '@docusaurus/useBaseUrl'
import { styles } from 'ansi-colors'
import classnames from 'classnames'

import versions from '../../versions.json'

function Version() {
  const context = useDocusaurusContext()
  const {siteConfig = {}} = context
  const latestVersion = versions[0]
  const pastVersions = versions.filter(version => version !== latestVersion)
  const pastVersionsReadTheDocs = [
 
  ]
  const repoUrl = `https://github.com/${siteConfig.organizationName}/${siteConfig.projectName}`
  return (
    <Layout
      permalink="/versions"
      keywords={["OpenHIM", "Versions"]}
      description="Versions page listing all documented site versions"
    >
      <header className={classnames('hero center page', styles.heroBanner)}>
        <div className="container">
          <p className="hero__subtitle subtitle">Documentation Versions</p>
        </div>
      </header>
      <div className="container margin-vert--lg" style={{textAlign: "center"}}>
        <div className="margin-bottom--lg">
          <h3 id="latest">Latest Version (Stable)</h3>
          <p>Here you can find the latest documentation.</p>
          <table style={{ display: "flex", justifyContent: "center"}}>
            <tbody>
              <tr>
                <th>{latestVersion}</th>
                <td>
                  <Link to={useBaseUrl('/docs/gettingStarted/introduction')}>
                    Documentation
                  </Link>
                </td>
                <td>
                  <a href={`${repoUrl}/releases/tag/v${latestVersion}`}>
                    Release Notes
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="margin-bottom--lg">
          <h3 id="next">Next version (Unreleased)</h3>
          <p>Here you can find the documentation for unreleased version.</p>
          <table>
            <tbody style={{ display: "flex", justifyContent: "center"}}>
              <tr>
                <th>master</th>
                <td>
                  <Link to={useBaseUrl('/docs/next/gettingStarted/introduction')}>
                    Documentation
                  </Link>
                </td>
                <td>
                  <a href={repoUrl}>Source Code</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {(pastVersions.length > 0 || pastVersionsReadTheDocs.length > 0) && (
          <div className="margin-bottom--lg">
            <h3 id="archive">Past Versions</h3>
            <p>
              Here you can find documentation for previous versions of {siteConfig.title}.
              For versions below <b>2.3.1</b> use the documentation for version <b>2.3.1</b>.
            </p>
            <table style={{ display: "flex", justifyContent: "center"}}>
              <tbody>
                {pastVersions.map(version => (
                  <tr key={version}>
                    <th>{version}</th>
                    <td>
                      <Link to={useBaseUrl(`/docs/${version}/gettingStarted/introduction`)}>
                        Documentation
                      </Link>
                    </td>
                    <td>
                      <a href={`${repoUrl}/releases/tag/v${version}`}>
                        Release Notes
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Version

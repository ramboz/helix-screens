/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fetchLastCommit from './fetch-last-commit'
import fetchMD from './fetch-md'
import fetchYAML from './fetch-yaml'
import getDevice from './get-device'

export default async (context, action, devCb, dispCb, chanCb) => {
    // Get the device props
    const devicePath = getDevice(context.request)
    const deviceProps = await fetchYAML(`${devicePath}.yaml`, action)
    let commitInfo = await fetchLastCommit(`${devicePath}.yaml`, action)

    let lastModified = commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : deviceProps.etag
    await devCb(lastModified, devicePath, deviceProps)
    
    if (deviceProps.display) {
        
        // Get the display props
        const displayPath = deviceProps.display
        const displayProps = await fetchYAML(`${displayPath}.yaml`, action)
        commitInfo = await fetchLastCommit(`${displayPath}.yaml`, action)

        lastModified = commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : displayProps.etag
        await dispCb(lastModified, displayPath, displayProps)
        
        // Get the channels content
        const channelRoles = Object.keys(displayProps.channels);
        for (let i = 0; i < channelRoles.length; i++) {
            const assignmentProps = displayProps.channels[channelRoles[i]]
            const channePath = assignmentProps.path.replace(/\.(html|md)$/, '')
            const channelContent = await fetchMD(`${channePath}.md`, action)
            const commitInfo = await fetchLastCommit(`${channePath}.md`, action)

            lastModified = commitInfo.commit ? new Date(commitInfo.commit.committer.date).getTime() : channelContent.etag
            await chanCb(lastModified, channePath, channelRoles[i], assignmentProps, channelContent)
        }
        
    }
}
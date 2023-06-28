var groups = [];

chrome.tabs.query({}, function (tabs) {

    const addNamesAndSave = (groups) => {
        // groups.forEach(function (group) {
        //     if (group.id !== "ungrouped") {
        //         chrome.tabGroups.get(group.id, function (info) {
        //             group.title = info.title
        //         })
        //     }
        // })
        console.log(groups);

        var blob = new Blob([JSON.stringify(groups)], { type: "text/json" });
        var url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,// The object URL can be used as download URL
            filename: "tabs.json"
        });

        localStorage.setItem("groups", JSON.stringify(groups));

    }

    const save = () => {
        addNamesAndSave(groups)
    }

    // console.log(tabs.length);
    n = 0
    tabs.forEach(function (tab) {
        if (tab.groupId) {
            var group = (tab.groupId === -1) ? groups.find(function (g) {
                return (g.id === "ungrouped")
            }) : groups.find(function (g) {
                return (g.id === tab.groupId)
            });
            if (!group) {
                group = {
                    id: tab.groupId,
                    tabs: []
                };
                groups.push(group);
            }
            group.tabs.push({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                windowId: tab.windowId

            });
            if (group.id === -1) {
                group.id = "ungrouped"
            }
        }
    });
    var groupsElement = document.getElementById("1");

    let btn = document.getElementById("savebtn")
    btn.addEventListener("click", () => { save() })

    groups.forEach(function (group) {
        // console.log(group);
        if (group.id !== "ungrouped") {
            chrome.tabGroups.get(group.id, function (info) {
                document.getElementById(group.id).innerHTML = "<h1>" + info.title + "</h1>"
                group.title = info.title
            })
        }
        var groupElement = document.createElement("details");
        groupElement.classList.add("accordion")
        // groupElement.open = "True"
        groupElement.innerHTML += "<summary class='accordion__title' id='" + group.id + "'><h1>" + group.id + "</h1></summary>";
        group.tabs.forEach(function (tab) {
            var tabElement = document.createElement("detail");
            tabElement.classList.add("accordion__constent")
            tabElement.innerHTML = "Tab ID: " + tab.id + ", Title: " + tab.title + ", URL: " + tab.url + "<br/><br/>";
            groupElement.appendChild(tabElement);
        });
        groupsElement.appendChild(groupElement);
    });

});

const importJson = async (fileText) => {

    let data = JSON.parse(fileText);

    // console.log(data);

    for (const group in data) {

        let DiscardTabId
        let tabList = data[group].tabs
        let GrpTitle = data[group].title
        let GrpId
        let GrpIdMade = false

        chrome.tabs.create(
            {
                url: tabList[0].url
            },
            (tab3) => {
                tabList.shift()
                chrome.tabs.group(
                    {
                        tabIds: [tab3.id]
                    }
                    ,
                    (gid) => {
                        GrpId = gid
                        GrpIdMade = true
                        data[group].id = gid
                        chrome.tabGroups.update(
                            gid,
                            {
                                title: GrpTitle
                            }
                        )

                        for (const tab in tabList) {
                            // console.log(tab);
                            chrome.tabs.create(
                                {
                                    url: tabList[tab].url
                                },
                                (tab2) => {
                                    chrome.tabs.group(
                                        {
                                            groupId: GrpId,
                                            tabIds: [tab2.id]
                                        },
                                        (gid) => {
                                            console.log(gid);
                                        }
                                    )
                                }
                            )
                        }
                    }
                )
                DiscardTabId = tab3.id
        })

        chrome.tabs.discard(DiscardTabId)

        // console.log(tabList);


        // const tabsData = () => {
        //     let tabIds = []
        //     let tabList = data[group].tabs
        //     // console.log(tabList);
        //     for (const tab in tabList) {
        //         console.log(tab);
        //         chrome.tabs.create(
        //             {
        //                 // openerTabId: tabList[tab].id,
        //                 url: tabList[tab].url
        //             }, (tab) => {



        //                 chrome.tabs.group(
        //                     {
        //                         groupId: data[group].id,
        //                         tabIds: [tab.id]
        //                     }
        //                 )

        //                 // tabIds.push(tab.id)
        //                 // console.log(tab);
        //             }
        //         )
        //     }

        //     return tabIds
        // }

        // let tabsData_ = tabsData()

        // chrome.tabs.group(
        //     {
        //         groupId: tabsData()[0].id,
        //         tabIds: tabsData()[1]
        //     }, (gid) => {
        //         console.log(gid);
        //         chrome.tabGroups.update(
        //             gid, {
        //             title: tabsData()[0].title
        //         }
        //         )
        //     }
        // )

        // return new Promise(tabsData)
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    // const fileContentDiv = document.getElementById('fileContent');

    fileInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            const reader = new FileReader();

            reader.onload = (fileEvent) => {
                const fileText = fileEvent.target.result;
                importJson(fileText)
            };


            reader.readAsText(selectedFile);
        }
    });


    var dropArea = document.getElementById('dropArea');

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        dropArea.classList.add('dragging');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        dropArea.classList.remove('dragging');
    }

    function handleDrop(event) {
        event.preventDefault();
        // dropArea.classList.remove('dragging');

        // var files = event.dataTransfer.files;
        // // Process the dropped files
        // for (var i = 0; i < files.length; i++) {
        //     var file = files[i];
        //     if (true) {
        //         console.log(files[i]);
        //         try {
        //             const reader = new FileReader();

        //             reader.onload = (fileEvent) => {
        //                 const fileText = fileEvent.target.result;
        //                 console.log(fileText);
        //                 importJson(fileText)
        //             };
        //         } catch (error) {
        //             console.log(error);
        //         }
        //     }
        // }

        var file = event.dataTransfer.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            var fileContent = e.target.result;
            // console.log('File contents:', fileContent);
            importJson(fileContent)
            // .then((obj) => {
            //     chrome.tabs.group(
            //         {
            //             groupId: obj[0].id,
            //             tabIds: obj[1]
            //         }, (gid) => {
            //             console.log(gid);
            //             chrome.tabGroups.update(
            //                 gid, {
            //                 title: obj[0].title
            //             }
            //             )
            //         }
            //     )
            // })
        };

        reader.readAsText(file);
    }
});
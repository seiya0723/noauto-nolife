---
title: "ReactでFullcalendar.jsを使う"
date: 2024-12-11T11:14:02+09:00
lastmod: 2024-12-11T11:14:02+09:00
draft: false
thumbnail: "images/react.jpg"
categories: [ "フロントサイド" ]
tags: [ "react","fullcalendar","備忘録" ]
---

## インストール

```
npm install @fullcalendar/react @fullcalendar/daygrid
```

## ソースコード

```
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import { useState, useEffect } from 'react';

const App = () => {

    const [events, setEvents] = useState([]);

    useEffect( () => {
        setEvents([
            { title: 'event 1', date: '2024-12-01' },
            { title: 'event 2', date: '2024-12-02' }
        ]);
    }, []);


    // FullCalendarに events 引数を与える。Stateで管理する。
    return (

        <main>
            <div className="container">
                <FullCalendar plugins={[ dayGridPlugin ]}

                    initialView="dayGridMonth"
                    locale="local"
                    events={events}
                 />
            </div>
        </main>
    )
}

export default App;
```

## 考察

今回は、useEffectでイベントを取得したが、実践ではfullcalendar.jsのeventSourceを使うほうが良いだろう。

なぜなら、useEffectはカレンダーの移動(来月・前月表示)をトリガーに発動できないから。

更にeventSourceはサーバーサイドへ表示範囲のパラメータまで送信している。

また、fullcalendar.js以外でeventsを使わないのであれば、Stateで管理する必要もなくなるだろう。

```
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

//import { useState, useEffect } from 'react';

const App = () => {

    /*
    const [events, setEvents] = useState([]);
    useEffect( () => {
        setEvents([
            { title: 'event 1', date: '2024-12-01' },
            { title: 'event 2', date: '2024-12-02' }
        ]);
    }, []);
    */

    const eventSources = [
        {
            url: "https://example.com/api/events",
            method: "GET",
            success: (data) => {
            }
        },
    ]

    // FullCalendarに events 引数を与える。Stateで管理する。
    return (

        <main>
            <div className="container">
                <FullCalendar plugins={[ dayGridPlugin ]}

                    initialView="dayGridMonth"
                    locale="local"
                    eventSources={eventSources}
                 />
            </div>
        </main>
    )
}

export default App;
```

ただ、eventSource終了後にクライアントサイドで絞り込みなどの処理をするのであれば、Stateで管理したほうがよいかもしれない。


if(localStorage.isDataSync === undefined) localStorage.isDataSync = true

function perc2color(perc) {
    var r, g, b = 0;
    b = 100
    if (perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}
const bg = document.querySelector('.content .cash-flow .main')
bg.style.backgroundColor = perc2color(100);

const date = new Date()
const $ = document.querySelector.bind(document)
let data = []
const dataRender = []
const groupElement = $('#group')

function groupData() {
    const gData = {}
    for (let i = 0; i < dataRender.length; i++) {
        const name = dataRender[i].name
        if (gData[name] === undefined) gData[name] = []
        gData[name].push(dataRender[i])
    }
    const result = []
    Object.keys(gData).forEach(key => {
        const array = gData[key]
        if (array.length <= 1) {
            result.push(gData[key][0])
        } else {
            result.push({
                name: `
                    ${array[0].name}
                    <ul>
                        ${array.map(
                            i => `
                                <li>
                                    <span class="${i.isDown ? 'red' : 'green'}">${(i.isDown ? '-' : '+') + formatMoney(i.money)}</span>
                                    <span> : </span> 
                                    <span class="blur">${formatDate(i.time)}</span>
                                </li>
                            `
                        ).join('')}
                    </ul>
                `,
                money: array.reduce((preVal, i) => preVal + i.money, 0),
                isDown: array[0].isDown,
                time: ''
            })

        }
    })
    return result
}

const filters = ['All', 'Day', 'Week', 'Month', 'Year']
let filterIndex = 0
function toggleFilterCashFlow(toggle = true) {
    if(toggle) ++filterIndex
    if (filterIndex >= filters.length) filterIndex = 0
    dataRender.splice(0, dataRender.length)
    if(typeof data === "string") data = JSON.parse(data)

    switch (filters[filterIndex]) {
        case ('All'): {
            data.forEach(i => {
                dataRender.push(i)
            })
            break
        }
        case ('Day'): {
            data.forEach(i => {
                if (isThisDay(i.time)) {
                    dataRender.push(i)
                }
            })
            break
        }
        case ('Week'): {
            data.forEach(i => {
                if (isThisWeek(i.time)) {
                    dataRender.push(i)
                }
            })
            break
        }
        case ('Month'): {
            data.forEach(i => {
                if (isThisMonth(i.time)) {
                    dataRender.push(i)
                }
            })
            break
        }
        case ('Year'): {
            data.forEach(i => {
                if (isThisYear(i.time)) {
                    dataRender.push(i)
                }
            })
            break
        }
    }
    if (groupElement.checked) renderData(groupData(dataRender))
    else renderData(dataRender)

}
$('.cash-flow .filter').addEventListener('click', toggleFilterCashFlow)

async function getDataFromServer() {
    const response = await fetch("https://excited-time-grandiflora.glitch.me/");
    const d = await response.json();
    localStorage.svData = JSON.stringify(d.d)
    data = d.d
    if(typeof data === "string") data = JSON.parse(data)

    $('#name-list').innerHTML = data.map(i => {
        return `<option value="${i.name}"></option>`
    }).join('')

    toggleFilterCashFlow(false)
}


data = JSON.parse(localStorage.svData)
console.log(data, typeof data)
$('#name-list').innerHTML = data.map(i => {
    return `<option value="${i.name}"></option>`
}).join('')
toggleFilterCashFlow(false)

if(window.navigator.onLine) {
    getDataFromServer()
    toggleFilterCashFlow(false)
} else {
    
}


function getDateDistance(date1, date2) {
    const diffTime = Math.abs(date2 - date1)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

function formatDayOfWeek(day) {
    if (day == 0) return 8
    return day + 1
}

function isThisWeek(dateCheck) {
    const thisDay = formatDayOfWeek(date.getDay())
    const dc = formatDayOfWeek((new Date(dateCheck)).getDay())
    if (dc > thisDay) return false
    return getDateDistance(date.getTime(), (new Date(dateCheck)).getTime()) < 7
}

const isThisYear = dateCheck => date.getFullYear() === (new Date(dateCheck)).getFullYear()
const isThisMonth = dateCheck => date.getMonth() === (new Date(dateCheck)).getMonth() && isThisYear(dateCheck)
const isThisDay = dateCheck => date.getDate() === (new Date(dateCheck)).getDate() && isThisMonth(dateCheck)

function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const d = date.getDate()
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
}

function formatMoney(m) {
    if (m >= 1_000_000_000) return `${m / 1_000_000_000}b`
    if (m >= 1_000_000) return `${m / 1_000_000}m`
    if (m >= 1000) return `${m / 1000}k`
    return m
}

function renderData(dataToRender) {
    let moneyDown = 0, moneyUp = 0
    let listHtml = ''
    dataToRender.forEach(i => {
        if (i.isDown) moneyDown += i.money
        else moneyUp += i.money
        listHtml += `
            <div class="item">
                <div class="name">
                    ${i.name}
                </div>
                <div class="info">
                    <span class="${i.isDown ? 'red' : 'green'}">
                        ${(i.isDown ? '-' : '+') + formatMoney(i.money)}
                    </span>
                    <span class="small blur">${formatDate(i.time)}</span>
                </div>
            </div>
        `
    })
    $('.cash-flow .filter .board span').innerText = filters[filterIndex]
    $('#money-down').innerText = formatMoney(moneyDown)
    $('#money-up').innerText = formatMoney(moneyUp)
    $('.content .detail .list').innerHTML = listHtml
}

const inputElement = $('.input')
$('.navbar .add').addEventListener('click', () => {
    inputElement.classList.remove('hidden')
    $('.preview .item .info .date').innerText = formatDate((new Date()).toDateString())
})

$('#btn-cancel').addEventListener('click', () => {
    inputElement.classList.add('hidden')
})

const inputName = $('#name'), inputMoney = $('#money'), inputUpDown = $('#up-down')

if(JSON.parse(localStorage.isDataSync)) {
    $('.sync').classList.remove('red')
    $('.sync').classList.add('green')
} else {
    $('.sync').classList.add('red')
    $('.sync').classList.remove('green')
}

$('#btn-add').addEventListener('click', () => {
    inputElement.classList.add('hidden')
    data.unshift({
        name: inputName.value.trim(),
        money: Number(inputMoney.value.trim()),
        isDown: !$('#up-down').checked,
        time: (new Date()).toDateString()
    })
    toggleFilterCashFlow(false)
    inputName.value = ''
    inputMoney.value = ''
    inputUpDown.checked = false

    localStorage.svData = JSON.stringify(data)
    localStorage.isDataSync = false
    $('.sync').classList.add('red')
    $('.sync').classList.remove('green')
    if (window.navigator.onLine) {
        postData('https://excited-time-grandiflora.glitch.me/', {d: JSON.stringify(data)})
        .then(d => {
            console.log('sync')
            localStorage.isDataSync = true
            $('.sync').classList.remove('red')
            $('.sync').classList.add('green')
        })
    }

    $('#name-list').innerHTML = data.map(i => {
        return `<option value="${i.name}"></option>`
    }).join('')
})

inputName.addEventListener('input', () => {
    $('.preview .item .name').innerText = inputName.value.trim()
})

inputMoney.addEventListener('input', () => {
    $('.preview .item .info .show-money .money').innerText = formatMoney(Number(inputMoney.value.trim()))
})

inputUpDown.addEventListener('input', () => {
    if (!inputUpDown.checked) {
        $('.preview .item .info .show-money').classList.add('red')
        $('.preview .item .info .show-money').classList.remove('green')
        $('.preview .item .info .show-money .plus').innerText = '-'
    } else {
        $('.preview .item .info .show-money').classList.remove('red')
        $('.preview .item .info .show-money').classList.add('green')
        $('.preview .item .info .show-money .plus').innerText = '+'
    }
})

groupElement.addEventListener('input', () => {
    if (groupElement.checked) renderData(groupData(dataRender))
    else renderData(dataRender)
})



async function getData() {
    const response = await fetch("https://excited-time-grandiflora.glitch.me/");
    const movies = await response.json();
}

async function postData(url = "", data = {}) {
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    });
    return response.json();
}

window.addEventListener('online', () => {
    postData('https://excited-time-grandiflora.glitch.me/', {d: JSON.stringify(data)})
        .then(d => {
            console.log('sync')
            localStorage.isDataSync = true
            $('.sync').classList.remove('red')
            $('.sync').classList.add('green')
        })
})


function greating() {
    const greatingElement = $('.greating')
    const h = date.getHours()
    if (h >= 4 && h < 11) {
        greatingElement.innerText = 'Good morning!'
    } else if (h < 13) {
        greatingElement.innerText = 'Good noon!'
    } else if (h <= 18) {
        greatingElement.innerText = 'Good afternoon!'
    } else {
        greatingElement.innerText = 'Good evening!'
    }
}

greating()
toggleFilterCashFlow(false)

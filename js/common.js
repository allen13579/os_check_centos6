$(function(){
    $('.arr i').hide();
    var result = null
    $("form").submit(function (e) { // 禁止form自动提交
        e.preventDefault();
    });
    const host_v = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/; // ip地址
    /*表单验证*/
    $('.input_bar[required]').on({
        focus: function () {
            $(this).siblings('.form_hint').hide(); // 隐藏提示
        },
        blur: function () {
            if (!$(this).val()) { // 值为空
                value_null($(this))
            } else {
                switch ($(this).attr('name')) {
                    case 'host':
                        if (host_v.test($(this).val())) {
                            $(this).val($(this).val().trim())
                            valid($(this))
                        } else {
                            invalid($(this))
                        }
                        break;
                    default:
                        $(this).val($(this).val().trim())
                        valid($(this))
                        break;
                }
            }
        }
    })
    /*发送请求*/
    $('#submit').on('click', function() {
        $('#form').find('.input_bar[required]').each(function (index, obj) {
            if (!$(this).val()) { // 值为空
                value_null($(this))
                return false;
            } else {
                switch ($(this).attr('name')) {
                    case 'host':
                        if (host_v.test($(this).val())) {
                            valid($(this))
                        } else {
                            invalid($(this))
                            return false;
                        }
                        break;
                    default:
                        valid($(this))
                        break;
                }
            }

            if (index === $('#form').find('.input_bar[required]').length -1) {
                $('.shadow').show(); // 打开loading
                result = null;
                $('.jsonData').html('');
                $('#view').attr('class', 'disable-button'); // 图形化按钮禁用
                $('#view').attr('disabled', true); // 图形化按钮禁用
                /*发送请求*/
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: 'http://localhost:18008/script/scriptToAPI/os_check_centos6',
                    data: $('#form').serialize(),
                    success: function (data) {
                        $('.shadow').hide(); // 关闭loading
                        $('.data').show() // 数据展示
                        if (data.code === 600000) { // 得到正确的数据
                            $('#view').attr('class', 'able-button').attr('disabled', false); // 图形化按钮放开
                        } else {
                            $('#view').attr('class', 'disable-button').attr('disabled', true); // 图形化按钮禁用
                        }
                        result = JSON.stringify(data)
                        $('.jsonData').html(result) // 渲染数据
                    },
                    error: function(data) {
                        $('.shadow').hide(); // 关闭loading
                        result = JSON.stringify(data)
                        $('.jsonData').html(result)
                    }
                });
            }
        })
    })
    /*表单重置*/
    $('#reset').on('click', function () {
        reset()
    })
    function value_null(obj) {
        obj.siblings('.form_hint').show();
        obj.siblings('.form_hint').text('值不能为空')
        obj.removeClass('inputValid')
        obj.addClass('inputInvalid')
    }
    function valid(obj) {
        obj.siblings('.form_hint').hide();
        obj.removeClass('inputInvalid')
        obj.addClass('inputValid')
    }
    function invalid(obj) {
        obj.siblings('.form_hint').show();
        obj.siblings('.form_hint').text('请输入正确的值')
        obj.removeClass('inputValid')
        obj.addClass('inputInvalid')
    }
    function reset() {
        $('#form').find('.input_bar').each(function () {
            $(this).val('')
            $(this).siblings('.form_hint').hide();
            $(this).removeClass('inputInvalid')
            $(this).removeClass('inputValid')
        })
    }
    /*数据格式化*/
    $('#jsonF').on('click', function () {
        const options = {
            quoteKeys: true,
            dom: '#jsonData' //对应容器的css选择器
        };
        const jf = new JsonFormater(options); //创建对象
        jf.doFormat(result); //格式化json
    })
    /*数据可视化*/
    $('#view').on('click', function () {
        $('.arr i:nth-child(1)').show(); // 箭头闪烁
        setTimeout(()=>{
            $('.arr i:nth-child(2)').show();
            setTimeout(()=>{ $('.arr i:nth-child(3)').show();},100)
        }, 100)
        setTimeout(()=>{
            $('.right_box').show();
            // 画图
            draw_1()
            draw_2()
            draw_3()
            draw_4()
            // $('.arr i').hide();
        },2000)
    })
    function draw_1() { // 内存饼图
        const data = JSON.parse(result).data
        const UsedMemory_per = parseFloat(data.UsedMemory.Values[0].Value) / 100; // 内存已用百分比
        const TotalMemory = data.TotalMemory.Values[0].Value; // 总内存
        const UsedMemory = Math.round(TotalMemory * UsedMemory_per)
        const freeMemory = TotalMemory - UsedMemory
        const product = {
            legend: ['已用内存', '可用内存'], data: [{ value: UsedMemory, name: '已用内存' }, { value: freeMemory, name: '可用内存' }]
        }
        const myChart = echarts.init(document.getElementById('right_box_center_left'));
        // 指定图表的配置项和数据
        const option = {
            title: {
                text: '内存使用情况',
                x: 'center',
                textStyle: {
                    color: '#ffffff'
                }
            },
            tooltip: {
                trigger: 'item', // item-数据项图形触发，axis-坐标轴触发
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                data: product.legend,
                top: '13%',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 10
                },
                itemWidth: 15,
                itemHeight: 4,
                type: 'scroll'
            },
            color: ['#1a2c32', '#01b2f3'],
            series: [
                {
                    name: '单位(Mb)',
                    type: 'pie',
                    radius: ['30%', '50%'],
                    center: ['50%', '60%'],
                    data: product.data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        lineStyle: {
                            color: '#01b2f3'
                        }
                    },
                    label: {
                        color: '#01b2f3'
                    }
                }
            ]
        }

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    }
    function draw_2() { // 进程饼图
        const data = JSON.parse(result).data
        const ZombieNumber = parseInt(data.ZombieNumber.Values[0].Value); // 僵尸进程
        const NormalNumber = parseInt(data.ProcessesNumber.Values[0].Value) - ZombieNumber // 正常进程
        const product = {
            legend: ['僵尸进程', '正常进程'], data: [{ value: ZombieNumber, name: '僵尸进程' }, { value: NormalNumber, name: '正常进程' }]
        }
        const myChart = echarts.init(document.getElementById('right_box_center_right'));
        // 指定图表的配置项和数据
        const option = {
            title: {
                text: '进程情况',
                x: 'center',
                textStyle: {
                    color: '#ffffff'
                }
            },
            tooltip: {
                trigger: 'item', // item-数据项图形触发，axis-坐标轴触发
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                data: product.legend,
                top: '13%',
                textStyle: {
                    color: '#ffffff',
                    fontSize: 10
                },
                itemWidth: 15,
                itemHeight: 4,
                type: 'scroll'
            },
            color: ['#FF0000', '#01b2f3'],
            series: [
                {
                    name: '单位(个)',
                    type: 'pie',
                    radius: ['30%', '50%'],
                    center: ['50%', '60%'],
                    data: product.data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        lineStyle: {
                            color: '#01b2f3'
                        }
                    },
                    label: {
                        color: '#01b2f3'
                    }
                }
            ]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    }
    function draw_3() { // 异常告警
        const data = JSON.parse(result).data
        const DmesgWarning = parseInt(data.DmesgWarning.Values[0].Value); // Dmesg告警数
        const FilesystemWarning = parseInt(data.FilesystemWarning.Values[0].Value); // 文件系统空间告警
        const MessagesWarning = parseInt(data.MessagesWarning.Values[0].Value); // Messages告警数
        const NotAvailableLV = parseInt(data['Not-AvailableLV'].Values[0].Value); // 异常状态lv数
        // const DmesgWarning = 1
        // const FilesystemWarning = 5
        // const MessagesWarning = 0
        // const NotAvailableLV = 0
        const product = {xAxis: ['Dmesg告警数', '文件系统空间告警数', 'Messages告警数', '异常状态lv数'], series: [DmesgWarning, FilesystemWarning, MessagesWarning, NotAvailableLV]}
        const myChart = echarts.init(document.getElementById('right_box_bottom'));
        // 指定图表的配置项和数据
        const option = {
            title: {
                text: '异常告警情况',
                x: 'center',
                textStyle: {
                    color: '#ffffff'
                }
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                show: false
            },
            grid: {
                top: '20%',
                left: '3%',
                right: '2%',
                bottom: '8%',
                containLabel: true
            },
            color: ['#FF0000', '#01b2f3'],
            yAxis: [
                {
                    type: 'value',
                    // axisLabel: {
                    //   textStyle: {
                    //     color: '#ffffff'
                    //   },
                    //   interval: 300
                    // },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisTick: {
                        length: 0,
                        lineStyle: {
                            color: '#ffffff'
                        }
                    },
                    splitLine: {
                        show: true
                    }
                }
            ],
            xAxis: [
                {
                    show: true,
                    type: 'category',
                    data: product.xAxis,
                    axisTick: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    axisLabel: {
                        // interval: 0,
                        rotate: 8
                    }
                }
            ],
            series: [
                {
                    name: '告警',
                    type: 'bar',
                    stack: '总量',
                    barMaxWidth: '20%',
                    label: {
                        normal: {
                            position: 'top',
                            show: true
                        }
                    },
                    data: product.series
                }
            ]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        let index = 0 // 播放所在下标
        setInterval(function() {
            console.log('fdfdfdsfds')
            myChart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: index
            })
            index++
            if (index > product.xAxis.length) {
                index = 0
            }
        }, 1000)
    }
    function draw_4() { // 其他信息
        const data = JSON.parse(result).data
        let item = ''
        const OSType = {name: data.OSType.Note, value: data.OSType.Values[0].Value}; // 操作系统类型
        item += '<p><span>' + OSType.name + ':</span><span>' + OSType.value + '</span></p>';
        const OSVersion = {name: data.OSVersion.Note, value: data.OSVersion.Values[0].Value}; // 操作系统版本
        item += '<p><span>' + OSVersion.name + ':</span><span>' + OSVersion.value + '</span></p>';
        const MachineTime = {name: data.MachineTime.Note, value: data.MachineTime.Values[0].Value}; // 操作系统时间
        item += '<p><span>' + MachineTime.name + ':</span><span>' + MachineTime.value + '</span></p>';
        const OSLoad = {name: data.OSLoad.Note, value: data.OSLoad.Values[0].Value}; // 系统负载【15分钟负载】
        item += '<p><span>' + OSLoad.name + ':</span><span>' + OSLoad.value + '</span></p>';
        const RunningTime = {name: data.RunningTime.Note, value: data.RunningTime.Values[0].Value + data.RunningTime.Unit}; // 运行时长
        item += '<p><span>' + RunningTime.name + ':</span><span>' + RunningTime.value + '</span></p>';
        $('.right_box_top').append(item)
    }
})
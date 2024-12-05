# 常用的脚本

这个网页会托管我写的一些脚本，为后续查找的方便。

## 将数据转换为 `Markdown` 表格的 `lua` 脚本

数据的格式大概是这样的

```
Running task1 ...
Computing disparity map for window_size=11, disparity_range=(0, 12), matching_function=SSD
time=0.34142351150512695
Computing disparity map for window_size=11, disparity_range=(0, 12), matching_function=SAD
time=0.3859138488769531
Computing disparity map for window_size=11, disparity_range=(0, 12), matching_function=normalized_correlation
time=0.7677674293518066
```

需要的是创建三个表格，分别代表 `SSD`, `SAD` 和 `normalized_correlation` 的运行时间信息，每一个表格的横坐标为视差的最大值，纵坐标为窗口大小，使用的 `lua` 脚本如下

```lua
local args = {...}

assert(#args > 0, "The lua script needs at least one arg input.")

local time_tables = {SSD={}, SAD={}, normalized={}}
local file_path = args[1]
local file = io.open(file_path, "r")
local running_line = "Running task1 ..."

local window_size_table = {}
local disparity_range_max_table = {}

local function insert_table(table_to_insert, val)
    local flag = true
    for _, value in ipairs(table_to_insert) do
        if (val == value) then
            flag = false
            break
        end
    end
    if (flag) then
        table.insert(table_to_insert, val)
    end
end

if file then
    while true do
        local line = file:read("*l")
        if not line then break end
        if (line == running_line) then
            goto continue
        end
        local window_size = line:match("window_size=(%d+)")
        local disparity_range_max = line:match("disparity_range=%(0, (%d+)%)")
        local matching_function = line:match("matching_function=(%w+)")
        line = file:read("*l")
        if not line then
            print("Error, missing time line in the end of the file after a param line")
        end
        insert_table(window_size_table, window_size)
        insert_table(disparity_range_max_table, disparity_range_max)
        local time = line:match("time=([^,]+)")
        local ok, value = pcall(rawget, time_tables[matching_function], window_size)
        if not ok or value == nil then
            time_tables[matching_function][window_size] = {}
        end
        time_tables[matching_function][window_size][disparity_range_max] = time
        ::continue::
    end
else
    print("Unalbe to open file "..file_path)
end

local function create_time_table(matching_function)
    file = io.open(args[2], "a")
    if not file then
        print("Unable to open file "..args[2].." for writing")
    else
        file:write("\n"..matching_function.."\n")
        file:write("| |")
        for _, disparity_range_max in ipairs(disparity_range_max_table) do
            file:write(" "..disparity_range_max.." |")
        end
        file:write("\n| --- |")
        for _ = 1, #disparity_range_max_table do
            file:write(" --- |")
        end
        file:write("\n")
        for _, window_size in ipairs(window_size_table) do
            file:write("| "..window_size.." |")
            for _, disparity_range_max in ipairs(disparity_range_max_table) do
                file:write(" "..time_tables[matching_function][window_size][disparity_range_max].." |")
            end
            file:write("\n")
        end
        file:close()
    end
end

create_time_table("SSD")
create_time_table("SAD")
create_time_table("normalized")
```

## 重构可视计算与交互概论电子教材排版的 `bash` 脚本

可视计算与交互概论的[线上教材](https://vcl-pku.github.io/vci-book/)是国内相关领域编写地很好的一部教材，大部分都很好，但我希望改造其中的每一节的排版，线上的教材是将每一节的每一小节都另外设置一个页面，这样查看起来需要经常翻页，可能不太方便，这里提供了一个脚本，可以将每一节的所有小节的内容合并到一个网页，从而跟原本的讲义排布查不多。将线上教材的[仓库](https://github.com/vcl-pku/vci-book)下载到本地，在项目根目录新建如下脚本，运行之即可实现更新内容和重新排版。

> [!INFO]
> 可视计算与交互概论的[线上教材](https://vcl-pku.github.io/vci-book/)编写的很好，将每一节的每一小节单独设置一个页面也是一个很好的排版方式，使得知识结构更加清晰，这里将其改为一个页面仅仅是我个人查阅的方便。

```bash
#!/bin/bash

git checkout .

git pull

directory="source"

find "$directory" -type f -name "index.md" -not -path "$directory/index.md" | while read -r file; do
    echo "处理文件：$file"
    # 读取文件名作为第一个参数
    base_dir=$(dirname "$file")

    # 找到最后一个 ``` 的行号
    last_backtick_line=$(grep -n '```' "$file" | tail -n 1 | cut -d: -f1)

    # 如果找不到两个 ```，则退出
    if [ -z "$last_backtick_line" ]; then
        continue
    fi

    # 从最后一个 ``` 开始向上查找，直到遇到第一个空行
    files=()
    for ((i = last_backtick_line - 1; i >= 1; i--)); do
        line=$(sed -n "${i}p" "$file")
        if [[ -z "$line" ]]; then
            break
        fi
        # 确保行不包含 ```
        if [[ "$line" != '```' ]]; then
            full_path="$base_dir/$line.md"
            files+=("$full_path")
            # 读取文件内容并拼接
            sed -i 's/^\(#\+\)/\1#/g' "$full_path"
        fi
    done

    sed -i ':a;N;$!ba;s/\n*```{toctree}.*```//;ta' "$file"

    for (( i=${#files[@]}-1; i>=0; i-- )); do 
        echo $'\n' >> "$file"
        cat ${files[i]} >> "$file"
        rm ${files[i]}
    done
done

sphinx-autobuild source build/html

git checkout .
```

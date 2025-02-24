#!/usr/bin/env bash

# origin: https://git.jetsung.com/idev/idevnav/blob/main/.deploy.sh
# lastmod: 2025-02-24

set -euo pipefail

IN_CHINA="${CHINA:-}"

COMMIT_MSG="" # 提交信息
PUBLISH_DIR=""  # 发布目录
PROJECT_NAME="" # 项目名称

PROJECT_NAME_MAIN="${BRANCH:-nav}"
PROJECT_NAME_MORE="${BRANCHM:-navs}"

GIT_BRANCH_NAME="${CI_COMMIT_BRANCH:-}"
if [ -z "$GIT_BRANCH_NAME" ]; then
  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    GIT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
  else
    GIT_BRANCH_NAME="main"
  fi
fi

DEPLOY="" # 部署

# 判断是 HUGO 还是 ZOLA 项目
if grep -q publishDir config.toml; then
  readonly CMD="hugo"
  readonly DATA_DIR="./data"
  readonly publishDir="publishDir"
elif grep -q output_dir config.toml; then
  readonly CMD="zola"
  readonly DATA_DIR="./content"
  readonly publishDir="output_dir"
  
else
  echo -e "\033[31merror: cannot determine command\033[0m"
  exit 1
fi

readonly ICON_DIR="static/assets/images/logos"
readonly NAVSITES_FILE="${DATA_DIR}/navsites.yml"
readonly SYNC_FILE=".sync.txt"
readonly SYNC_FILE_ERROR_LOG="$SYNC_FILE.error.log"

check_command() {
    command -v "$1" >/dev/null 2>&1
}

check_in_china() {
    if [ "$(curl -s -m 3 -o /dev/null -w "%{http_code}" https://www.google.com)" != "200" ]; then
        IN_CHINA=1
    fi
}

# 判断是否为 URL 的函数
is_url() {
    local url="$1"
    # 正则表达式匹配 URL
    if [[ "$url" =~ ^https?://[^[:space:]]+ ]]; then
        return 0  # 是 URL
    else
        return 1  # 不是 URL
    fi
}

# 处理参数信息
judgment_parameters() {
    while [[ "$#" -gt '0' ]]; do
        case "$1" in
            '-d' | '--deploy') # 部署
                DEPLOY="true"
                ;;
            '-p' | '--publish') # 部署目录
                shift
                PUBLISH_DIR="${1:?"error: Please specify the correct publish directory."}"
                ;;
            '-g' | '--git')
                shift
                COMMIT_MSG="${1:?"error: Please specify the correct commit message."}"
                ;;
            '-h' | '--help')
                show_help
                ;;
            *)
                echo "$0: unknown option -- $1" >&2
                exit 1
                ;;
        esac
        shift
    done
}

# 显示帮助信息
show_help() {
    cat <<EOF
usage: $0 [ options ]

  -h, --help                           print help
  -d, --deploy                         deploy
  -p, --publish <publish>              set publish directory
  -g, --git <git>                      set commit message
EOF
    exit 0
}

# 获取发布目录
get_publish_dir() {
  PUBLISH_DIR="$(grep $publishDir config.toml | awk -F '\"' '{print $2}')" # static files
}

# 获取项目名称
get_project_name() {
  if [ "$GIT_BRANCH_NAME" = "main" ]; then   # 精选
    PROJECT_NAME="$PROJECT_NAME_MAIN"
  elif [ "$GIT_BRANCH_NAME" = "more" ]; then # 全量 
    PROJECT_NAME="$PROJECT_NAME_MORE"
  fi 
}

# more 分支处理
action_for_more_bracnch() {
  # 拉取 main 分支文件
  git checkout main -- .gitignore .gitlab-ci.yml README.md .deploy.sh config.toml "${DATA_DIR}/friendlinks.yml" "${DATA_DIR}/headers.yml"

  # update config.toml
  sed -i 's#精选导航#全量导航#g' config.toml
  sed -i 's#nav.idev.top#navs.idev.top#g' config.toml

  # update {data,content}/headers.yml
  sed -i 's#全量#精选#g' "${DATA_DIR}/headers.yml"
  sed -i 's#navs.idev.top#nav.idev.top#g' "${DATA_DIR}/headers.yml"
  sed -i 's#bi-circle-fill#bi-circle-half#g' "${DATA_DIR}/headers.yml"
}

# 检测参数是否正确
check_parameters() {
  if [ -z "${PUBLISH_DIR:-}" ]; then
    echo "error: publish directory cannot be empty."
    exit 1
  fi
}

# git push
git_commit_and_push() {
  if [ -n "${COMMIT_MSG:-}" ]; then
    git add .
    git commit -am "feat: $COMMIT_MSG"
    git push origin "$GIT_BRANCH_NAME"  
  fi
}

# 部署到 Cloudflare
deploy_to_cloudflare() {
  if [ -n "${DEPLOY:-}" ]; then
    if [ -n "${PROJECT_NAME:-}" ]; then
      echo -e "no\n" | wrangler pages deploy "$PUBLISH_DIR" \
        --project-name "$PROJECT_NAME" \
        --branch main  
    fi
  fi
}

# 同步图片逻辑
sync_images() {
    if [ "$GIT_BRANCH_NAME" = "more" ]; then
        # 从 main 分支同步图片
        while IFS= read -r image; do
            echo -e "Syncing from main: $image"
            git checkout main -- "$image"
        done < <(tail -n+2 "$SYNC_FILE")
    elif [ "$GIT_BRANCH_NAME" = "main" ]; then
        # 记录需要同步的图片到 .sync.txt
        echo "# sync logos images" > "$SYNC_FILE"
        while IFS= read -r image; do
            local filename=${image##*/}
            local filepath="$ICON_DIR/$filename"
            if [ -f "$filepath" ]; then
                echo -e "Recording for sync: $filename"
                echo "$filepath" >> "$SYNC_FILE"
            fi
        done < <(git status --porcelain | grep logos)
    fi
}

# 提取域名部分，补充协议和域名
extract_domain() {
  local url=$1
  local domain_part
  local protocol
  local domain

  # # 使用正则表达式提取域名部分
  # if [[ $url =~ ^[^/]*//([^/?]+)(/|$) ]]; then
  #   domain_part="${BASH_REMATCH[1]}"
  # fi

  # 提取协议和域名部分（去掉路径和参数）
  if [[ $url =~ ^(https?)://([^/?#]+) ]]; then
      protocol="${BASH_REMATCH[1]}"  # 提取协议 http 或 https
      domain="${BASH_REMATCH[2]}"    # 提取域名
      domain_part="${protocol}://${domain}"
  else
      # 如果 URL 不带协议，默认添加 https://
      domain_part="https://${url%%/*}"
  fi

  # 移除 www. 前缀（如果存在）
  # domain_part="${domain_part#www.}"

  echo "$domain_part"
}

# URL 转义函数
url_escape() {
  local input="$1"
  local escaped=""
  
  # 遍历输入字符串中的每一个字符
  for (( i=0; i<${#input}; i++ )); do
    char="${input:$i:1}"
    
    # 检查字符是否需要转义
    case "$char" in
      # 保留字符无需转义 (RFC 3986)
      [A-Za-z0-9-_.~])
        escaped+="$char"
        ;;
      # 其他字符进行转义
      *)
        # 将字符转换为 ASCII 十六进制形式
        hex=$(printf "%02X" "'$char")
        escaped+="%$hex"
        ;;
    esac
  done
  
  echo "$escaped"
}

# URL 去除协议
strip_protocol() {
  local url="$1"
  local protocol="${url%%://*}"
  local rest="${url#"$protocol://"}"
  echo "$rest"
}

# 下载图标
download_icon() {
    if ! is_url "$1"; then
      echo -e "\033[33mWarning: $1 is not a url\033[0m"
      return
    fi
  
    local download_url="$1"

    printf "Saving %s: \n  %-40s" "$cleaned_name" "$download_url"
    if ! curl --connect-timeout 30 -fsL -o "$filepath" "$download_url"; then
      echo -e "\033[33mWarning: favicon $logo skipped...\033[0m\n"
      echo "$logo" >> "$SYNC_FILE_ERROR_LOG"
    fi
}

# 获取图标 URL
get_icon_url() {
  local hub="$1"
  local part="$2"
  local icon_url=""
  case "${hub:-}" in
    google)
      url_part=$(url_escape "$part")
      icon_url=$(printf "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=%s&size=48" "$url_part")
      ;;
    google_cn)
      url_part=$(url_escape "$part")
      icon_url=$(printf "https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=%s&size=48" "$url_part")
      ;;
    yandex)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://favicon.yandex.net/favicon/%s" "$url_part")
      ;;
    toolb)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://toolb.cn/favicon/%s" "$url_part")
      ;;
    faviconextractor)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://www.faviconextractor.com/favicon/%s" "$url_part")
      ;;
    cccyun)
      icon_url=$(printf "https://favicon.cccyun.cc/%s" "$part")
      ;;
    skiy)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://favicon.skiy.net/%s" "$url_part")
      ;;
    api_1)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://favicons.ooos.top/?url=%s" "$url_part")
      ;;
    api_2)
      url_part=$(strip_protocol "$part")
      icon_url=$(printf "https://favicon.ooos.top/?url=%s" "$url_part")
      ;;
  esac
  
  echo "$icon_url" | tr -d '[:space:]'
}

# 处理图标
process_icons() {
  logo="${1:-}"
  url="${2:-}"
  favicon_url="${3:-}"

  if [ -z "$logo" ]; then
    return
  fi

  if [ -z "$url" ] && [ -z "$favicon_url" ]; then
    return
  fi

  # 生成文件名
  local cleaned_name
  cleaned_name=$(echo "$logo" | tr -d '[:space:]')
  filepath="$ICON_DIR/$cleaned_name"  

  favicon_url=$(echo "$favicon_url" | tr -d '[:space:]')

  if [ ! -f "$filepath" ]; then
    # 从 main 拉取 LOGO
    if [ "$GIT_BRANCH_NAME" = "more" ]; then    
      git checkout main -- "$filepath"
      if [ -f "$filepath" ]; then
        return
      fi
    fi

    if [ -n "$favicon_url" ]; then 
      download_icon "$favicon_url"
    fi

    if [ -f "$filepath" ]; then
      return
    fi

    url_part=$(extract_domain "$url")

    local icon_hub=(
      "google_cn"
      "api_1"
      "google"
      "cccyun"
      "faviconextractor"
      "toolb"
      "yandex"
      "skiy"      
      "api_2"
    )

    for hub in "${icon_hub[@]}"; do
      if [ -f "$filepath" ]; then
        return
      fi

      local dl_url
      dl_url=$(get_icon_url "$hub" "$url_part")
      download_icon "$dl_url"
    done
  fi
}

# 处理 webstack.yml
process_webstack() {
  declare -A current_block
  in_block=0

  touch "$SYNC_FILE_ERROR_LOG"

  # 逐行读取文件
  while IFS= read -r line; do
      # 检测是否以 "- title:" 开头
      if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*title: ]]; then
          # 如果已经在处理一个块，则输出当前块的 logo、url 和 favicon
          if [[ $in_block -eq 1 ]]; then
              # echo "Logo: ${current_block[logo]:-N/A}"
              # echo "URL: ${current_block[url]:-N/A}"
              # echo "Favicon: ${current_block[favicon]:-N/A}"
              # echo "-------------------"
              process_icons "${current_block[logo]:-}" "${current_block[url]:-}" "${current_block[favicon]:-}"
          fi
          # 重置当前块
          current_block=()
          in_block=1
      fi

      # 提取 logo、url 和 favicon 字段
      if [[ $in_block -eq 1 ]]; then
          if [[ "$line" =~ ^[[:space:]]*logo:[[:space:]]*(.*) ]]; then
              current_block[logo]=${BASH_REMATCH[1]}
          elif [[ "$line" =~ ^[[:space:]]*url:[[:space:]]*\"?(.*[^[:space:]])\"? ]]; then
              current_block[url]=${BASH_REMATCH[1]}
          elif [[ "$line" =~ ^[[:space:]]*favicon:[[:space:]]*(.*) ]]; then
              current_block[favicon]=${BASH_REMATCH[1]}
          fi
      fi
  done < "$NAVSITES_FILE"

  # 输出最后一个块的 logo、url 和 favicon
  if [[ $in_block -eq 1 ]]; then
      # echo "Logo: ${current_block[logo]:-N/A}"
      # echo "URL: ${current_block[url]:-N/A}"
      # echo "Favicon: ${current_block[favicon]:-N/A}"
      # echo "-------------------"
      process_icons "${current_block[logo]:-}" "${current_block[url]:-}" "${current_block[favicon]:-}"
  fi

  echo
}

fetch_icons() {
  if [ ! -d "$ICON_DIR" ]; then
    mkdir -p "$ICON_DIR"
  fi
  
  sync_images
  process_webstack
}

main() {
  get_publish_dir
  get_project_name

  judgment_parameters "$@"

  check_parameters

  if [ -z "${GITLAB_CI:-}" ]; then
    if [ "$GIT_BRANCH_NAME" = "more" ]; then
      action_for_more_bracnch
    fi
  fi

  rm -rf "$PUBLISH_DIR"  

  echo
  echo "COMMIT_MSG: $COMMIT_MSG"
  echo "GIT_BRANCH_NAME: $GIT_BRANCH_NAME"
  echo
  echo "DEPLOY: $DEPLOY"
  echo "PROJECT: $CMD"
  echo "PUBLISH_DIR: $PUBLISH_DIR"
  echo "PROJECT_NAME: $PROJECT_NAME"
  echo

  if [ "$(command -v $CMD)" ]; then
    if [ "$CMD" = "hugo" ]; then
      hugo build --minify
    elif [ "$CMD" = "zola" ]; then
      zola build
    fi
  fi

  if [ ! -d "$PUBLISH_DIR" ]; then
      echo -e "\033[31moutput dir $PUBLISH_DIR not found\033[0m"
      exit 1
  fi    

  if [ -z "$IN_CHINA" ]; then
    check_in_china
  fi

  if [ -z "${GITLAB_CI:-}" ]; then
    fetch_icons
    git_commit_and_push
  fi

  deploy_to_cloudflare
}

main "$@"

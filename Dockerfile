FROM python:slim
WORKDIR /app

COPY action.py .
COPY requirements.txt .
COPY entrypoint.sh .

RUN pip install -r requirements.txt
RUN chmod u+x entrypoint.sh

CMD /app/entrypoint.sh
